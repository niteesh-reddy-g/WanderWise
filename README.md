WanderWise
----------

### Your AI-Powered Personal Travel Concierge.

🖼️ Preview
-----------

_An intuitive, AI-driven interface designed for the modern traveler._

🌟 About the Project
--------------------

**The Problem:** Planning a trip often involves hours of juggling multiple tabs—blogs, reviews, maps, and hotel listings. Most travelers suffer from "decision paralysis" when trying to build a cohesive daily schedule.

**The Solution:** **WanderWise** simplifies travel planning into a 30-second process. By leveraging Google’s Gemini AI, the app takes your starting point, destination, and duration to generate a hyper-personalized itinerary. It doesn't just list places; it crafts a journey that matches your vibe and budget.

🛠 Tech Stack
-------------

**LayerTechnologyFrontend**React.js (Vite) & Tailwind CSS**UI Components**Shadcn/UI**Backend/Auth**Firebase (Firestore & Authentication)**AI Engine**Google Gemini Pro API**Maps & Data**Google Places API

🚀 Core Features
----------------

*   **AI-Driven Itineraries:** Generates day-by-day plans including morning, afternoon, and evening activities.
    
*   **Source-to-Destination Planning:** Intelligent routing based on your starting location.
    
*   **Preference Tuning:** Specify trip details (Budget, Solo/Family, Interests) to refine AI suggestions.
    
*   **Smart Hotel Recommendations:** Curated stay options with visual previews via Google Places.
    
*   **Secure Trip Storage:** Save your generated plans to your Firebase-backed profile for future access.
    

🏗 Getting Started
------------------

### Prerequisites

Before you begin, ensure you have:

*   **Node.js** (v18.x or later)
    
*   **npm** or **yarn**
    
*   A **Google Cloud Project** (for Gemini & Places API keys)
    
*   A **Firebase Project** (for Auth and Database)
    

### Installation

1.  Bashgit clone https://github.com/niteesh-reddy-g/WanderWise.gitcd WanderWise
    
2.  Bashnpm install
    
3.  Create a .env file in the root directory:Code snippetVITE\_GOOGLE\_PLACE\_API\_KEY=your\_google\_places\_keyVITE\_GOOGLE\_GEMINI\_AI\_API\_KEY=your\_gemini\_api\_key# Firebase ConfigurationVITE\_FIREBASE\_API\_KEY=your\_api\_keyVITE\_FIREBASE\_AUTH\_DOMAIN=your\_project.firebaseapp.comVITE\_FIREBASE\_PROJECT\_ID=your\_project\_id
    
4.  Bashnpm run devOpen http://localhost:5173 to start planning.
    

📖 Usage
--------

1.  **Authenticate:** Sign in using your Google account.
    
2.  **Plan:** Enter your source, destination, and trip duration.
    
3.  **Customize:** Select your preferences (e.g., Adventure vs. Relaxation).
    
4.  **Generate:** View your AI-crafted schedule, complete with maps, photos, and budget estimates.
    

🗺 Roadmap
----------

*   \[ \] **Export to PDF:** Download your itinerary for offline use.
    
*   \[ \] **Interactive Maps:** Real-time route optimization using Google Maps API.
    
*   \[ \] **Budget Tracker:** Log actual expenses against AI estimates.
    
*   \[ \] **Social Sharing:** Share your travel plans with friends via unique links.
    

🤝 Contributing
---------------

Contributions make the open-source community an amazing place.

1.  Fork the Project.
    
2.  Create your Feature Branch (git checkout -b feature/NewFeature).
    
3.  Commit your Changes (git commit -m 'Add NewFeature').
    
4.  Push to the Branch (git push origin feature/NewFeature).
    
5.  Open a Pull Request.
