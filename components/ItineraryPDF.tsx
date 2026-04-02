import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { Itinerary } from '../types';

// Register fonts
Font.register({ family: 'Inter', fonts: [{ src: 'Helvetica' }, { src: 'Helvetica-Bold', fontWeight: 'bold' }] });

const PRIMARY_COLOR = '#16A34A';

const styles = StyleSheet.create({
  page: { paddingHorizontal: 40, paddingVertical: 40, fontFamily: 'Inter', fontSize: 10, color: '#333', lineHeight: 1.4 },
  
  coverTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 20, lineHeight: 1.2, hyphens: 'none' },
  
  daySection: { marginBottom: 20 },
  dayTitle: { fontSize: 14, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 8 },
  
  heroImage: { width: '100%', height: 150, borderRadius: 8, objectFit: 'cover', marginBottom: 10 },
  
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 5, marginTop: 10 },
  timeHeader: { fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  activityContainer: { marginBottom: 8 },
  activityDescription: { lineHeight: 1.4, flexDirection: 'row', marginBottom: 2, paddingLeft: 30 },
  bullet: { width: 15, fontSize: 10 },
  descriptionText: { flex: 1, fontSize: 10 },
  
  watermark: { position: 'absolute', bottom: 30, right: 40, fontSize: 10, color: '#999', opacity: 0.5 },
});

export const ItineraryPDF: React.FC<{ itinerary: Itinerary }> = ({ itinerary }) => {
  const getSection = (act: { time: string, description: string }) => {
    const t = (act.time || '').toLowerCase();
    const d = (act.description || '').toLowerCase();
    
    if (d.includes('dinner')) return 'Evening';
    if (d.includes('breakfast')) return 'Morning';
    if (d.includes('lunch')) return 'Afternoon';
    
    let hour = parseInt(t.match(/\d+/)?.[0] || '0');
    if (t.includes('pm') && hour < 12) hour += 12;
    if (t.includes('am') && hour === 12) hour = 0;
    
    if (t.includes('morning') || (hour >= 5 && hour < 12)) return 'Morning';
    if (t.includes('afternoon') || (hour >= 12 && hour < 17)) return 'Afternoon';
    if (t.includes('evening') || (hour >= 17 && hour < 20)) return 'Evening';
    if (t.includes('night') || hour >= 20 || (hour > 0 && hour < 5)) return 'Night';
    
    if (t.includes('pm')) return 'Afternoon';
    if (t.includes('am')) return 'Morning';
    
    return 'Morning';
  };

  const renderSection = (section: { name: string, acts: any[] }) => (
    <View key={section.name}>
      <Text style={styles.sectionTitle}>{section.name}</Text>
      {section.acts.map((act, i) => {
        const points = (act.description || '').split('•').map((p: string) => p.trim()).filter((p: string) => p);
        if (points.length === 0) return null;
        return (
          <View key={i} style={styles.activityContainer}>
            <Text style={styles.timeHeader}>{act.time}</Text>
            {points.map((p: string, j: number) => (
              <View key={j} style={styles.activityDescription}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.descriptionText}>{p}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.coverTitle}>{itinerary.tripTitle}</Text>
        
        {itinerary.itinerary.map((day) => {
          const sectionsMap: { [key: string]: typeof day.activities } = { Morning: [], Afternoon: [], Evening: [], Night: [] };
          
          (day.activities || []).forEach(act => {
            if (!act.description || act.description.trim() === '') return;
            sectionsMap[getSection(act)].push(act);
          });

          const activeSections = ['Morning', 'Afternoon', 'Evening', 'Night']
            .map(name => ({ name, acts: sectionsMap[name] }))
            .filter(sec => sec.acts.length > 0);

          if (activeSections.length === 0) return null;

          const firstSection = activeSections[0];
          const remainingSections = activeSections.slice(1);

          return (
            <View key={day.day} style={styles.daySection}>
              <View wrap={false}>
                <Text style={styles.dayTitle}>{`Day-${day.day}: ${day.title}`}</Text>
                {day.imageUrl && <Image style={styles.heroImage} src={day.imageUrl} />}
                {renderSection(firstSection)}
              </View>
              {remainingSections.map(sec => renderSection(sec))}
            </View>
          );
        })}
        
        <Text style={styles.watermark} fixed>WanderWise</Text>
      </Page>
    </Document>
  );
};
