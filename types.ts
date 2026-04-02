
export interface TripDetails {
  origin: string;
  destination: string;
  duration: string;
  interests: string;
}

export type ActivityType = 'food' | 'sightseeing' | 'culture' | 'activity' | 'travel' | 'shopping';

export interface Activity {
  time: string;
  description: string;
  type: ActivityType;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  imageUrl?: string;
}

export interface Itinerary {
  tripTitle: string;
  destination: string;
  duration: number;
  itinerary: DayPlan[];
  hasImageErrors?: boolean;
}
