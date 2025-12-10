
export enum AppView {
  CHAT = 'CHAT',
  ANALYZE = 'ANALYZE',
  GARDEN = 'GARDEN',
}

export type Language = 'en' | 'tr';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PlantAnalysisResult {
  name: string;
  scientificName?: string;
  careInstructions: string;
  waterNeeds: string;
  sunNeeds: string;
  rawResponse: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface Reminder {
  id: string;
  plantName: string;
  action: string;
  dueInHours: number;
  createdAt: number;
  dueDate: number;
}

export type JournalActivityType = 'Water' | 'Fertilize' | 'Prune' | 'Repot' | 'Mist' | 'Other';

export interface JournalEntry {
  id: string;
  date: number;
  activity: JournalActivityType;
  note?: string;
}

export interface SavedPlant {
  id: string;
  name: string;
  scientificName?: string; // Optional, parsed from markdown if possible
  dateSaved: number;
  imageBase64: string | null;
  analysisResult: string;
  personalNotes?: string;
  soilType?: string; // New field for soil information
  // New fields for watering tracker
  wateringInterval?: number; // Frequency in days (e.g., 7 for weekly)
  lastWatered?: number; // Timestamp of last watering
  journal?: JournalEntry[]; // History of care
}
