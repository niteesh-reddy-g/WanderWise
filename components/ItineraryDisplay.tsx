import React, { useRef, useState } from 'react';
import type { Itinerary, DayPlan, Activity, ActivityType } from '../types';
import { FoodIcon } from './icons/FoodIcon';
import { SightseeingIcon } from './icons/SightseeingIcon';
import { CultureIcon } from './icons/CultureIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { TravelIcon } from './icons/TravelIcon';
import { ShoppingIcon } from './icons/ShoppingIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { Download, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ItineraryDisplayProps {
  itinerary: Itinerary | null;
  isLoading: boolean;
  error: string | null;
}

const ActivityTypeIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  const iconProps = { className: "w-6 h-6 text-primary-500" };
  switch (type) {
    case 'food': return <FoodIcon {...iconProps} />;
    case 'sightseeing': return <SightseeingIcon {...iconProps} />;
    case 'culture': return <CultureIcon {...iconProps} />;
    case 'activity': return <ActivityIcon {...iconProps} />;
    case 'travel': return <TravelIcon {...iconProps} />;
    case 'shopping': return <ShoppingIcon {...iconProps} />;
    default: return <SightseeingIcon {...iconProps} />;
  }
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    <div className="bg-gray-200 h-10 w-3/4 rounded-lg mx-auto"></div>
    <div className="bg-gray-200 h-6 w-1/2 rounded-lg mx-auto"></div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
          <div className="h-48 bg-gray-300 rounded-xl mb-6"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-300 rounded-full w-8 h-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WelcomeMessage: React.FC = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6 bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-primary-100"
    >
        <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPinIcon className="w-10 h-10 text-primary-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Ready for an Adventure?</h2>
        <p className="mt-4 text-lg text-soft-text max-w-md mx-auto">Fill out the form above and let our AI craft a unique, image-rich itinerary just for you.</p>
    </motion.div>
);

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, isLoading, error }) => {
  const itineraryRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    if (!itinerary || isDownloading) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25; // Increased margin for a cleaner look
      const contentWidth = pageWidth - (margin * 2);
      let yOffset = 0;

      // --- Header ---
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.text('WanderWise', margin, 25);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225); // Slate 300
      doc.text(`Your ${itinerary.duration}-day trip to ${itinerary.destination}`, margin, 38);
      
      yOffset = 75;

      // --- Itinerary Content ---
      for (const day of itinerary.itinerary) {
        // Check if we need a new page for the day title
        if (yOffset > pageHeight - 60) {
          doc.addPage();
          yOffset = 30;
        }

        // Day Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(15, 23, 42);
        doc.text(`Day ${day.day}: ${day.title}`, margin, yOffset);
        yOffset += 15;

        // Day Image
        if (day.imageUrl) {
          try {
            const imgWidth = contentWidth;
            const imgHeight = (imgWidth * 9) / 16; // Maintain 16:9 aspect ratio
            
            // Check if image fits on current page
            if (yOffset + imgHeight > pageHeight - 30) {
              doc.addPage();
              yOffset = 30;
            }

            // Add a subtle border around the image
            doc.setDrawColor(241, 245, 249); // Slate 100
            doc.setLineWidth(0.5);
            doc.rect(margin - 0.5, yOffset - 0.5, imgWidth + 1, imgHeight + 1);
            
            doc.addImage(day.imageUrl, 'JPEG', margin, yOffset, imgWidth, imgHeight, undefined, 'MEDIUM');
            yOffset += imgHeight + 20;
          } catch (e) {
            console.error('Failed to add image to PDF', e);
          }
        }

        // Activities
        for (const activity of day.activities) {
          // Process bullet points
          const points = activity.description
            .split('\n')
            .map(p => p.trim().replace(/^[•\-\*]\s*/, ''))
            .filter(p => p.length > 0);
          
          // Estimate height needed
          let neededHeight = 15; // Title + spacing
          points.forEach(p => {
            const lines = doc.splitTextToSize(p, contentWidth - 10);
            neededHeight += (lines.length * 6) + 2;
          });

          if (yOffset + neededHeight > pageHeight - 25) {
            doc.addPage();
            yOffset = 30;
          }

          // Activity Time & Type
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(30, 41, 59); // Slate 800
          doc.text(`${activity.time} • ${activity.type.toUpperCase()}`, margin, yOffset);
          yOffset += 8;

          // Activity Description (Bullet points style)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(71, 85, 105); // Slate 600
          
          points.forEach(point => {
            const lines = doc.splitTextToSize(point, contentWidth - 10);
            
            // Draw bullet point
            doc.setFont('helvetica', 'bold');
            doc.text('•', margin, yOffset);
            
            // Draw text
            doc.setFont('helvetica', 'normal');
            doc.text(lines, margin + 6, yOffset);
            
            yOffset += (lines.length * 6) + 2;
          });
          
          yOffset += 8; // Space after activity
        }

        // Subtle divider between days
        if (itinerary.itinerary.indexOf(day) < itinerary.itinerary.length - 1) {
          if (yOffset < pageHeight - 30) {
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.setLineWidth(0.2);
            doc.line(margin, yOffset, pageWidth - margin, yOffset);
            yOffset += 20;
          }
        }
      }

      // --- Footer ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        doc.text('Generated by WanderWise AI Trip Planner', margin, pageHeight - 10);
      }

      doc.save(`WanderWise-${itinerary.destination.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-sm"
      >
        <h3 className="font-bold text-xl mb-2">Oops! Something went wrong.</h3>
        <p>{error}</p>
      </motion.div>
    );
  }

  if (!itinerary) {
    return <WelcomeMessage />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900"
          >
            {itinerary.tripTitle}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-lg text-soft-text flex items-center justify-center md:justify-start gap-2"
          >
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            A {itinerary.duration}-day adventure in {itinerary.destination}
          </motion.p>
          {itinerary.hasImageErrors && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-amber-600 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              Some images couldn't be generated due to high demand, but your full plan is ready!
            </motion.p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadPdf}
          disabled={isDownloading}
          className={`flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-colors ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF
            </>
          )}
        </motion.button>
      </div>
      
      <div ref={itineraryRef} className="space-y-10 pb-10">
        <AnimatePresence mode="popLayout">
          {itinerary.itinerary.map((dayPlan, index) => (
            <DayCard key={dayPlan.day} dayPlan={dayPlan} index={index} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};


const DayCard: React.FC<{ dayPlan: DayPlan; index: number }> = ({ dayPlan, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 group"
    >
      {dayPlan.imageUrl && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={dayPlan.imageUrl} 
            alt={dayPlan.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Day {dayPlan.day}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white drop-shadow-md">
              {dayPlan.title}
            </h3>
          </div>
        </div>
      )}

      <div className="p-8">
        {!dayPlan.imageUrl && (
          <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-slate-100">
            <div className="bg-primary-100 p-3 rounded-2xl">
                <CalendarIcon className="w-6 h-6 text-primary-600"/>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-800">Day {dayPlan.day}</h3>
                <p className="text-soft-text font-medium">{dayPlan.title}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dayPlan.activities.map((activity, idx) => (
            <ActivityItem key={idx} activity={activity} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};


const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  // Split description by bullet points if they exist
  const points = activity.description.split('\n').map(p => p.trim().replace(/^[•\-\*]\s*/, '')).filter(p => p.length > 0);

  return (
    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="flex-shrink-0 bg-white shadow-sm border border-slate-100 rounded-xl p-3">
         <ActivityTypeIcon type={activity.type} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">
            {activity.type}
          </span>
          <span className="text-sm font-bold text-slate-400">•</span>
          <p className="text-sm font-bold text-slate-900">{activity.time}</p>
        </div>
        <div className="space-y-1">
          {points.length > 1 ? (
            <ul className="list-disc list-inside text-soft-text leading-relaxed space-y-1">
              {points.map((point, i) => (
                <li key={i} className="pl-1"><span className="relative -left-1">{point}</span></li>
              ))}
            </ul>
          ) : (
            <p className="text-soft-text leading-relaxed">{activity.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};