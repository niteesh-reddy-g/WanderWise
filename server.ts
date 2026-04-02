import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for itineraries based on session ID
const itinerariesStore: Record<string, any[]> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API routes
  app.get("/api/itineraries/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const userItineraries = itinerariesStore[sessionId] || [];
    res.json(userItineraries);
  });

  app.post("/api/itineraries/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const itinerary = req.body;
    
    if (!itinerariesStore[sessionId]) {
      itinerariesStore[sessionId] = [];
    }
    
    itinerariesStore[sessionId].push(itinerary);
    res.json({ success: true, itinerary });
  });

  app.delete("/api/itineraries/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    itinerariesStore[sessionId] = [];
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
