import React, { useState, useEffect } from 'react';
import { TripForm } from './components/TripForm';
import { ItineraryDisplay } from './components/ItineraryDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { Itinerary, TripDetails } from './types';
import { generateItinerary } from './services/geminiService';
import { motion } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';

const getSessionId = () => {
  let sessionId = localStorage.getItem('wanderwise_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('wanderwise_session_id', sessionId);
  }
  return sessionId;
};

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Itinerary[]>([]);
  const sessionId = getSessionId();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/itineraries/${sessionId}`);
        if (response.ok) {
          const savedHistory = await response.json();
          setHistory(savedHistory.reverse()); // Show newest first
        }
      } catch (e) {
        console.error('Failed to load history from cloud', e);
      }
    };
    loadHistory();
  }, [sessionId]);

  const handleFormSubmit = async (tripDetails: TripDetails) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    try {
      const generatedItinerary = await generateItinerary(tripDetails);
      setItinerary(generatedItinerary);
      
      // Save to cloud
      try {
        await fetch(`/api/itineraries/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generatedItinerary)
        });
        setHistory(prev => [generatedItinerary, ...prev]);
      } catch (storageError) {
        console.error('Failed to save to cloud', storageError);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (selected: Itinerary) => {
    setItinerary(selected);
    window.scrollTo({ top: document.getElementById('itinerary-section')?.offsetTop || 500, behavior: 'smooth' });
  };

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      await fetch(`/api/itineraries/${sessionId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear history from cloud', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-800 bg-[#fdfbf7]">
      <Header history={history} onSelectHistory={handleSelectHistory} onClearHistory={handleClearHistory} />
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12 md:py-20 w-full max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl shadow-2xl shadow-primary-100/50 rounded-[2.5rem] p-8 md:p-12 border border-white/80"
        >
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Plan less. Explore <span className="text-green-600">more</span>
            </h2>
            <p className="text-lg text-soft-text font-medium">
              Plan your perfect trip from flights to hotels. Tell us your destination and we'll build a custom itinerary.
            </p>
          </div>
          <TripForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </motion.div>

        <div id="itinerary-section" className="mt-20">
          <ItineraryDisplay 
            itinerary={itinerary} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;