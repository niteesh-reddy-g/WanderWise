
import { GoogleGenAI, Type } from "@google/genai";
import type { Itinerary, TripDetails } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { 
        type: Type.STRING,
        description: "A creative and catchy title for the trip plan. e.g. 'An Adventurous 5-Day Journey in Tokyo'"
    },
    destination: { 
        type: Type.STRING,
        description: "The primary destination of the trip."
    },
    duration: { 
        type: Type.INTEGER,
        description: "The total number of days for the trip."
    },
    itinerary: {
      type: Type.ARRAY,
      description: "An array of daily plans for the trip.",
      items: {
        type: Type.OBJECT,
        properties: {
          day: { 
              type: Type.INTEGER,
              description: "The day number of the itinerary (e.g., 1, 2, 3)."
          },
          title: { 
              type: Type.STRING,
              description: "A short, engaging title for the day's theme or main event. e.g., 'Historic Heart of the City'"
          },
          activities: {
            type: Type.ARRAY,
            description: "A list of activities planned for the day.",
            items: {
              type: Type.OBJECT,
              properties: {
                time: { 
                    type: Type.STRING, 
                    description: "Suggested time for the activity, e.g., '9:00 AM' or 'Morning'." 
                },
                description: { 
                    type: Type.STRING,
                    description: "A detailed description of the activity."
                },
                type: {
                  type: Type.STRING,
                  enum: ['food', 'sightseeing', 'culture', 'activity', 'travel', 'shopping'],
                  description: "Categorize the activity."
                },
              },
              required: ['time', 'description', 'type'],
            },
          },
        },
        required: ['day', 'title', 'activities'],
      },
    },
  },
  required: ['tripTitle', 'destination', 'duration', 'itinerary'],
};

export const generateItinerary = async (tripDetails: TripDetails): Promise<Itinerary> => {
  const { origin, destination, duration, interests } = tripDetails;
  
  const systemInstruction = `You are an expert travel agent specializing in creating personalized travel itineraries. Your task is to generate a detailed, day-by-day travel plan based on the user's origin, destination, trip duration, and interests.
- Include flight planning: Suggest flight times and details for Day 1 (departure from ${origin}) and the last day (return to ${origin}).
- Provide a mix of popular attractions and unique local experiences.
- Suggest specific places, restaurants, or sights.
- For each activity, provide a list of clear, concise bullet points. Each sentence MUST be its own bullet point. Do NOT write paragraphs.
- Use the format:
  • First point
  • Second point
- Ensure the plan is logical and geographically sensible for each day.
- The output MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

  const prompt = `Generate a trip plan for a ${duration}-day trip from ${origin} to ${destination} for someone interested in ${interests}. Include flight suggestions and travel logistics.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const parsedItinerary = JSON.parse(jsonText) as Itinerary;
    
    // Basic validation
    if (!parsedItinerary.itinerary || !Array.isArray(parsedItinerary.itinerary)) {
        throw new Error("Invalid itinerary format received from API.");
    }

    // Generate images for each day sequentially to avoid rate limits (429 errors)
    const itineraryWithImages = [];
    let hasImageErrors = false;
    for (const day of parsedItinerary.itinerary) {
      let imageUrl = undefined;
      let retries = 3; // Increased retries
      let waitTime = 3000; // Increased initial wait time

      // Proactive delay between requests to stay under rate limits
      if (itineraryWithImages.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      while (retries >= 0) {
        try {
          const imagePrompt = `A beautiful, high-quality travel photograph of ${day.title} in ${destination}. The image should capture the essence of the activities: ${day.activities.map(a => a.description).join(', ')}. Professional travel photography style, vibrant colors, clear details. IMPORTANT: The image must NOT contain any text, letters, numbers, signs, or watermarks. Pure visual scenery only.`;
          
          const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [{ parts: [{ text: imagePrompt }] }],
            config: {
              imageConfig: {
                aspectRatio: "16:9",
              },
            },
          });

          const imagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
          if (imagePart?.inlineData?.data) {
            imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          }
          break; // Success, exit retry loop
        } catch (error: any) {
          const errorMsg = error?.message || String(error);
          const isRateLimit = errorMsg.includes('429') || error?.status === 429 || error?.code === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isRateLimit && retries > 0) {
            console.warn(`Rate limit hit for Day ${day.day}, retrying in ${waitTime}ms... (Retries left: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            waitTime *= 2; // Exponential backoff
            retries--;
          } else {
            console.error(`Failed to generate image for Day ${day.day}:`, error);
            hasImageErrors = true;
            break; // Non-retryable error or no retries left
          }
        }
      }
      itineraryWithImages.push({ ...day, imageUrl });
    }

    return {
      ...parsedItinerary,
      itinerary: itineraryWithImages,
      hasImageErrors
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error("Failed to generate itinerary. The model may have returned an invalid format or an error occurred.");
  }
};
