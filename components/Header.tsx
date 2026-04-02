import React, { useState } from 'react';
import { Globe, History, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Itinerary } from '../types';

interface HeaderProps {
  history: Itinerary[];
  onSelectHistory: (itinerary: Itinerary) => void;
  onClearHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ history, onSelectHistory, onClearHistory }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 max-w-5xl">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => window.location.reload()}
          >
            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Wander<span className="text-primary-600">Wise</span>
            </h1>
          </motion.div>

          <nav className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary-600 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-200"
              >
                <History className="w-4 h-4" />
                Destinations
                <ChevronDown className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isHistoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2"
                  >
                    <div className="px-4 py-2 border-b border-slate-50 mb-2 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Itineraries</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearHistory();
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>
                    {history.length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-400 text-sm italic">
                        No trips generated yet.
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {history.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              onSelectHistory(item);
                              setIsHistoryOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex flex-col gap-1 border-b border-slate-50 last:border-0"
                          >
                            <span className="font-bold text-slate-800 text-sm truncate">{item.tripTitle}</span>
                            <span className="text-xs text-slate-500">{item.destination} • {item.duration} days</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};