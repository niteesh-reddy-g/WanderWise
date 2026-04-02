import React, { useState } from 'react';
import type { TripDetails } from '../types';
import { Sparkles, MapPin, Calendar, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface TripFormProps {
  onSubmit: (details: TripDetails) => void;
  isLoading: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [duration, setDuration] = useState<string>('5');
  const [interests, setInterests] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && duration && interests) {
      onSubmit({ origin, destination, duration, interests });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1"
        >
          <label htmlFor="origin" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            Source
          </label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g., New York"
            required
            className="block w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1"
        >
          <label htmlFor="destination" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo"
            required
            className="block w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-1"
        >
          <label htmlFor="duration" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <Calendar className="w-4 h-4 text-primary-600" />
            Days
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="30"
            required
            className="block w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
          />
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label htmlFor="interests" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
          <Heart className="w-4 h-4 text-primary-600" />
          Trip Preferences & Details
        </label>
        <textarea
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g., affordable flights, hotels near sites, use public transport, street food, historical sites..."
          required
          rows={4}
          className="block w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all resize-none"
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-primary-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <LoadingSpinner className="w-6 h-6 animate-spin" />
                <span>Crafting Your Journey...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate My Itinerary</span>
              </>
            )}
          </div>
        </button>
      </motion.div>
    </form>
  );
};