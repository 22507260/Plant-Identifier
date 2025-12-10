import React, { useState, useEffect } from 'react';
import { SavedPlant, Language, JournalEntry, JournalActivityType } from '../types';
import { getSavedPlants, deletePlantFromGarden, updatePlantNote, updatePlantWatering, addPlantJournalEntry, updatePlantSoilType } from '../services/storageService';
import { MarkdownText } from './MarkdownText';

interface GardenViewProps {
  lang: Language;
}

const UI_TEXT = {
  en: {
    title: 'My Garden',
    subtitle: 'Your collection of identified plants.',
    empty: 'Your garden is empty. Identify plants and save them here!',
    delete: 'Delete',
    view: 'View Details',
    savedOn: 'Saved on',
    personalNotes: 'Personal Notes',
    saveNote: 'Save Note',
    placeholderNotes: 'Add general notes about this plant...',
    close: 'Close',
    careSchedule: 'Care Schedule',
    watering: 'Watering Frequency',
    days: 'days',
    every: 'Water every',
    set: 'Set',
    waterNow: 'I Watered It Today',
    nextWater: 'Next water:',
    overdue: 'Overdue by',
    today: 'Water Today!',
    daysLeft: 'days left',
    saveSchedule: 'Save Schedule',
    journal: 'Care Journal',
    addLog: 'Add Log',
    logActivity: 'Log Activity',
    activities: {
      Water: 'Water',
      Fertilize: 'Fertilize',
      Prune: 'Prune',
      Repot: 'Repot',
      Mist: 'Mist',
      Other: 'Other'
    },
    journalPlaceholder: 'Add a note for this activity...',
    noJournal: 'No logs yet. Track your plant care here!',
    autoLogWater: 'Journal entry added automatically.',
    soilTitle: 'Soil Type',
    soilPlaceholder: 'e.g., Peat moss, Sandy, Loam...',
    saveSoil: 'Save'
  },
  tr: {
    title: 'Bahçem',
    subtitle: 'Tanımlanmış bitki koleksiyonunuz.',
    empty: 'Bahçeniz boş. Bitkileri tanımlayın ve buraya kaydedin!',
    delete: 'Sil',
    view: 'Detaylar',
    savedOn: 'Kaydedildi',
    personalNotes: 'Kişisel Notlar',
    saveNote: 'Notu Kaydet',
    placeholderNotes: 'Bu bitki hakkında genel notlar ekleyin...',
    close: 'Kapat',
    careSchedule: 'Bakım Takvimi',
    watering: 'Sulama Sıklığı',
    days: 'gün',
    every: 'Her',
    set: 'Ayarla',
    waterNow: 'Bugün Suladım',
    nextWater: 'Sonraki sulama:',
    overdue: 'Gecikti:',
    today: 'Bugün Sula!',
    daysLeft: 'gün kaldı',
    saveSchedule: 'Takvimi Kaydet',
    journal: 'Bakım Günlüğü',
    addLog: 'Ekle',
    logActivity: 'Aktivite Ekle',
    activities: {
      Water: 'Sulama',
      Fertilize: 'Gübreleme',
      Prune: 'Budama',
      Repot: 'Saksı Değişimi',
      Mist: 'Nemlendirme',
      Other: 'Diğer'
    },
    journalPlaceholder: 'Bu aktivite için not ekle...',
    noJournal: 'Henüz kayıt yok. Bakım geçmişini buradan takip et!',
    autoLogWater: 'Günlük kaydı otomatik eklendi.',
    soilTitle: 'Toprak Tipi',
    soilPlaceholder: 'örn. Torf, Kumlu, Tınlı...',
    saveSoil: 'Kaydet'
  }
};

const ACTIVITY_ICONS: Record<JournalActivityType, {icon: string, color: string}> = {
  Water: { icon: 'water_drop', color: 'bg-blue-100 text-blue-600' },
  Fertilize: { icon: 'compost', color: 'bg-green-100 text-green-600' },
  Prune: { icon: 'content_cut', color: 'bg-orange-100 text-orange-600' },
  Repot: { icon: 'potted_plant', color: 'bg-amber-100 text-amber-700' },
  Mist: { icon: 'water_mist', color: 'bg-cyan-100 text-cyan-600' },
  Other: { icon: 'edit_note', color: 'bg-gray-100 text-gray-600' },
};

// Styling themes for different watering statuses
const STATUS_THEMES = {
  overdue: {
    container: 'bg-red-50 border-red-200',
    header: 'text-red-900',
    icon: 'text-red-600',
    barBack: 'bg-red-200',
    barFront: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-50 text-red-700 border-red-200'
  },
  today: {
    container: 'bg-amber-50 border-amber-200',
    header: 'text-amber-900',
    icon: 'text-amber-600',
    barBack: 'bg-amber-200',
    barFront: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  future: {
    container: 'bg-blue-50 border-blue-100',
    header: 'text-blue-900',
    icon: 'text-blue-600',
    barBack: 'bg-blue-200',
    barFront: 'bg-blue-500',
    text: 'text-blue-700',
    badge: 'bg-blue-50 text-blue-700 border-blue-200'
  }
};

export const GardenView: React.FC<GardenViewProps> = ({ lang }) => {
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<SavedPlant | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Watering states
  const [wateringInterval, setWateringInterval] = useState<number>(7);

  // Journal Entry Form State
  const [journalType, setJournalType] = useState<JournalActivityType>('Water');
  const [journalNote, setJournalNote] = useState('');

  // Soil Type State
  const [soilTypeInput, setSoilTypeInput] = useState('');
  
  const text = UI_TEXT[lang];

  useEffect(() => {
    // Async load
    const load = async () => {
        const data = await getSavedPlants();
        setPlants(data);
    };
    load();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(lang === 'tr' ? 'Bu bitkiyi silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this plant?')) {
      await deletePlantFromGarden(id);
      setPlants(prev => prev.filter(p => p.id !== id));
      if (selectedPlant?.id === id) {
        setSelectedPlant(null);
      }
    }
  };

  const openPlant = (plant: SavedPlant) => {
    setSelectedPlant(plant);
    setNoteText(plant.personalNotes || '');
    setWateringInterval(plant.wateringInterval || 7);
    setSoilTypeInput(plant.soilType || '');
    setJournalType('Water');
    setJournalNote('');
  };

  const handleNoteSave = async () => {
    if (selectedPlant) {
        // Update local state immediately for responsiveness
        const updatedPlant = { ...selectedPlant, personalNotes: noteText };
        setPlants(prev => prev.map(p => p.id === selectedPlant.id ? updatedPlant : p));
        setSelectedPlant(updatedPlant);
        
        // Persist
        await updatePlantNote(selectedPlant.id, noteText);
    }
  }

  const handleSoilSave = async () => {
    if (selectedPlant) {
      const updatedPlant = { ...selectedPlant, soilType: soilTypeInput };
      setPlants(prev => prev.map(p => p.id === selectedPlant.id ? updatedPlant : p));
      setSelectedPlant(updatedPlant);
      
      await updatePlantSoilType(selectedPlant.id, soilTypeInput);
    }
  }

  const handleWateringSave = async () => {
      if (selectedPlant) {
          // If never watered, assume watered today when setting schedule
          const lastWatered = selectedPlant.lastWatered || Date.now();
          const updatedPlant = {...selectedPlant, wateringInterval, lastWatered};
          
          setPlants(prev => prev.map(p => p.id === selectedPlant.id ? updatedPlant : p));
          setSelectedPlant(updatedPlant);
          
          await updatePlantWatering(selectedPlant.id, wateringInterval, lastWatered);
      }
  }

  const handleWaterNow = async () => {
      if (selectedPlant) {
          const now = Date.now();
          const interval = selectedPlant.wateringInterval || wateringInterval;
          
          // 1. Update Scheduling
          let updatedPlant = {...selectedPlant, lastWatered: now, wateringInterval: interval};
          
          // 2. Auto-log to Journal
          const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: now,
            activity: 'Water',
            note: lang === 'tr' ? 'Hızlı işlem ile kaydedildi.' : 'Logged via quick action.'
          };
          
          const updatedJournal = [newEntry, ...(updatedPlant.journal || [])];
          updatedPlant = { ...updatedPlant, journal: updatedJournal };

          setPlants(prev => prev.map(p => p.id === selectedPlant.id ? updatedPlant : p));
          setSelectedPlant(updatedPlant);
          
          await updatePlantWatering(selectedPlant.id, interval, now);
          await addPlantJournalEntry(selectedPlant.id, newEntry);
      }
  }

  const handleAddJournalEntry = async () => {
    if (selectedPlant) {
      const now = Date.now();
      const newEntry: JournalEntry = {
        id: now.toString(),
        date: now,
        activity: journalType,
        note: journalNote
      };

      const updatedJournal = [newEntry, ...(selectedPlant.journal || [])];
      
      // If action is Watering, update lastWatered too to keep things in sync
      let updatedPlant = { ...selectedPlant, journal: updatedJournal };
      if (journalType === 'Water') {
        updatedPlant.lastWatered = now;
        await updatePlantWatering(selectedPlant.id, selectedPlant.wateringInterval, now);
      }

      setPlants(prev => prev.map(p => p.id === selectedPlant.id ? updatedPlant : p));
      setSelectedPlant(updatedPlant);
      
      await addPlantJournalEntry(selectedPlant.id, newEntry);
      
      // Reset form
      setJournalNote('');
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Calculates detailed status about the watering schedule.
   * Returns progress percentage (0-100), days left, and specific status enum.
   */
  const getWateringState = (plant: SavedPlant, intervalOverride?: number) => {
      const interval = intervalOverride !== undefined ? intervalOverride : plant.wateringInterval;
      if (!interval || !plant.lastWatered) return null;
      
      const lastWatered = plant.lastWatered;
      const intervalMs = interval * 24 * 60 * 60 * 1000;
      const nextWatering = lastWatered + intervalMs;
      const now = Date.now();
      const diffMs = nextWatering - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      // Progress bar logic:
      // 0% means just watered (now == lastWatered)
      // 100% means next watering is due (now == nextWatering)
      const elapsed = now - lastWatered;
      const progress = Math.min(100, Math.max(0, (elapsed / intervalMs) * 100));
      
      let status: 'overdue' | 'today' | 'future' = 'future';
      if (daysLeft < 0) status = 'overdue';
      else if (daysLeft === 0) status = 'today';
      
      return { 
          status, 
          days: Math.abs(daysLeft), 
          progress, 
          nextDate: nextWatering 
      };
  }

  return (
    <div className="flex flex-col h-full bg-green-50 relative">
        {/* Header */}
        <div className="p-6 pt-12 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-green-100">
            <h2 className="text-2xl font-bold text-green-900 mb-1">{text.title}</h2>
            <p className="text-green-700 text-sm">{text.subtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
            {plants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8 border-2 border-dashed border-green-200 rounded-3xl bg-white/50">
                    <span className="material-symbols-rounded text-6xl text-green-200 mb-4">potted_plant</span>
                    <p className="text-green-800 font-medium">{text.empty}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {plants.map(plant => {
                        const state = getWateringState(plant);
                        const theme = state ? STATUS_THEMES[state.status] : STATUS_THEMES.future;
                        
                        // Calculate health indicator colors
                        let healthColor = 'bg-green-500';
                        let healthRing = 'ring-green-100';
                        const isUrgent = state?.status === 'overdue' || state?.status === 'today';
                        
                        if (state?.status === 'overdue') {
                            healthColor = 'bg-red-500';
                            healthRing = 'ring-red-100';
                        } else if (state?.status === 'today') {
                            healthColor = 'bg-orange-500';
                            healthRing = 'ring-orange-100';
                        }

                        return (
                            <div 
                                key={plant.id}
                                onClick={() => openPlant(plant)}
                                className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition-all active:scale-95 cursor-pointer flex flex-col h-full relative group"
                            >
                                <div className="aspect-square bg-gray-100 relative">
                                    {plant.imageBase64 ? (
                                        <img src={plant.imageBase64} alt={plant.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-green-200">
                                            <span className="material-symbols-rounded text-5xl">image_not_supported</span>
                                        </div>
                                    )}
                                    <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent flex justify-end">
                                        <button 
                                            onClick={(e) => handleDelete(e, plant.id)}
                                            className="text-white/80 hover:text-red-400 p-1 bg-black/20 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-lg block">delete</span>
                                        </button>
                                    </div>
                                    
                                    {/* Watering Status Card Overlay */}
                                    {state && (
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <div className={`p-2 rounded-xl border shadow-sm backdrop-blur-md ${theme.badge} bg-opacity-95`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                                                        {state.status === 'overdue' && <span className="material-symbols-rounded text-sm">priority_high</span>}
                                                        {state.status === 'today' && <span className="material-symbols-rounded text-sm">water_drop</span>}
                                                        {state.status === 'future' && <span className="material-symbols-rounded text-sm">calendar_today</span>}
                                                        
                                                        {state.status === 'overdue' ? text.overdue : 
                                                         state.status === 'today' ? text.today : 
                                                         text.nextWater.replace(':', '')}
                                                    </span>
                                                    
                                                    {state.status !== 'today' && (
                                                        <span className="text-xs font-extrabold">
                                                            {state.days} {text.days}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme.barBack} bg-opacity-50`}>
                                                    <div 
                                                        className={`h-full rounded-full ${theme.barFront}`} 
                                                        style={{ width: `${state.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-center gap-2">
                                        <h3 className="font-bold text-green-900 text-sm line-clamp-1 flex-1">{plant.name}</h3>
                                        {/* Health Dot Indicator */}
                                        <div 
                                            className={`w-2.5 h-2.5 rounded-full ${healthColor} ring-4 ${healthRing} flex-shrink-0 ${isUrgent ? 'animate-pulse' : ''}`}
                                            title="Health Status"
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(plant.dateSaved)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Detail Modal */}
        {selectedPlant && (
            <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-slide-up">
                <div className="p-4 border-b border-green-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 pt-safe-top z-10">
                    <h3 className="font-bold text-green-900 truncate pr-4 text-lg">{selectedPlant.name}</h3>
                    <button 
                        onClick={() => setSelectedPlant(null)}
                        className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm border border-red-200 transition-all"
                    >
                        <span className="material-symbols-rounded text-xl block">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 pb-24 scroll-smooth">
                    {/* Hero Image */}
                    {selectedPlant.imageBase64 && (
                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 shadow-md border border-green-50 bg-gray-100">
                            <img 
                                src={selectedPlant.imageBase64} 
                                alt={selectedPlant.name} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    
                    {/* Care Schedule Section */}
                    {(() => {
                        const state = getWateringState(selectedPlant, wateringInterval);
                        const theme = state ? STATUS_THEMES[state.status] : STATUS_THEMES.future;
                        
                        return (
                            <div className={`border rounded-2xl p-5 mb-6 transition-all shadow-sm ${theme.container}`}>
                                <h4 className={`font-bold mb-4 flex items-center justify-between ${theme.header}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-rounded text-2xl ${theme.icon}`}>alarm</span>
                                        {text.careSchedule}
                                    </div>
                                    
                                    {state && (
                                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full bg-white/80 border shadow-sm backdrop-blur-sm ${theme.text}`}>
                                            {state.status === 'overdue' && `${text.overdue} ${state.days} ${text.days}`}
                                            {state.status === 'today' && text.today}
                                            {state.status === 'future' && `${text.nextWater} ${state.days} ${text.daysLeft}`}
                                        </span>
                                    )}
                                </h4>
                                
                                {state && (
                                    <div className="mb-6 bg-white/50 p-3 rounded-xl border border-white/60">
                                        <div className="flex justify-between text-xs font-semibold mb-2 opacity-80">
                                           <span>0%</span>
                                           <span>50%</span>
                                           <span>100%</span>
                                        </div>
                                        <div className={`h-3 w-full rounded-full overflow-hidden ${theme.barBack}`}>
                                            <div 
                                                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${theme.barFront}`} 
                                                style={{ width: `${state.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-[11px] font-medium text-gray-500">
                                            <span>{text.savedOn}: {formatDate(selectedPlant.lastWatered!)}</span>
                                            <span>{formatDate(state.nextDate)}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 mb-5 p-2 bg-white/60 rounded-xl border border-white/50">
                                    <span className="text-sm font-semibold whitespace-nowrap pl-2">{lang === 'tr' ? 'Sıklık:' : 'Every:'}</span>
                                    <div className="flex-1 flex items-center justify-between">
                                        <button 
                                            onClick={() => setWateringInterval(Math.max(1, wateringInterval - 1))}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-lg">remove</span>
                                        </button>
                                        <span className="font-bold text-lg text-gray-800 min-w-[30px] text-center">{wateringInterval}</span>
                                        <button 
                                            onClick={() => setWateringInterval(wateringInterval + 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                        >
                                            <span className="material-symbols-rounded text-lg">add</span>
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500 pr-2">{text.days}</span>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleWateringSave}
                                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        {text.saveSchedule}
                                    </button>
                                    <button 
                                        onClick={handleWaterNow}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-rounded text-lg">water_drop</span>
                                        {text.waterNow}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Care Journal Section */}
                    <div className="bg-white border border-green-100 rounded-2xl p-4 mb-6 shadow-sm">
                        <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                             <span className="material-symbols-rounded text-green-600">history_edu</span>
                             {text.journal}
                        </h4>

                        {/* Journal Entry Input */}
                        <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                              {(Object.keys(ACTIVITY_ICONS) as JournalActivityType[]).map((type) => (
                                <button
                                  key={type}
                                  onClick={() => setJournalType(type)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all border ${
                                    journalType === type 
                                    ? ACTIVITY_ICONS[type].color + ' border-transparent shadow-sm' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                   <span className="material-symbols-rounded text-sm">{ACTIVITY_ICONS[type].icon}</span>
                                   {text.activities[type]}
                                </button>
                              ))}
                           </div>
                           <div className="flex gap-2">
                             <input 
                               type="text" 
                               value={journalNote}
                               onChange={(e) => setJournalNote(e.target.value)}
                               placeholder={text.journalPlaceholder}
                               className="flex-1 text-sm p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500"
                             />
                             <button 
                               onClick={handleAddJournalEntry}
                               className="bg-green-600 text-white px-4 rounded-lg font-bold text-sm shadow-sm hover:bg-green-700 transition-colors"
                             >
                               {text.addLog}
                             </button>
                           </div>
                        </div>

                        {/* Journal List */}
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                           {(!selectedPlant.journal || selectedPlant.journal.length === 0) ? (
                              <p className="text-center text-sm text-gray-400 italic py-4">{text.noJournal}</p>
                           ) : (
                              selectedPlant.journal.sort((a,b) => b.date - a.date).map((entry) => (
                                 <div key={entry.id} className="flex gap-3 items-start">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ACTIVITY_ICONS[entry.activity].color}`}>
                                        <span className="material-symbols-rounded text-lg">{ACTIVITY_ICONS[entry.activity].icon}</span>
                                     </div>
                                     <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start">
                                           <span className="font-bold text-gray-800 text-sm">{text.activities[entry.activity]}</span>
                                           <span className="text-[10px] text-gray-400">{formatDate(entry.date)}</span>
                                        </div>
                                        {entry.note && (
                                           <p className="text-xs text-gray-600 mt-0.5">{entry.note}</p>
                                        )}
                                     </div>
                                 </div>
                              ))
                           )}
                        </div>
                    </div>

                    <MarkdownText content={selectedPlant.analysisResult} />
                    
                    <div className="mt-8 pt-6 border-t border-green-100 pb-safe-bottom">
                        {/* Soil Type Section */}
                        <div className="mb-6">
                           <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                <span className="material-symbols-rounded text-green-600">terrain</span>
                                {text.soilTitle}
                           </h4>
                           <div className="flex gap-2">
                             <input
                               type="text"
                               value={soilTypeInput}
                               onChange={(e) => setSoilTypeInput(e.target.value)}
                               placeholder={text.soilPlaceholder}
                               className="flex-1 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-900 focus:outline-none focus:border-green-500"
                             />
                             <button 
                                onClick={handleSoilSave}
                                className="bg-green-100 text-green-800 px-4 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors"
                             >
                                {text.saveSoil}
                             </button>
                           </div>
                        </div>

                        <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                             <span className="material-symbols-rounded text-green-600">edit_note</span>
                             {text.personalNotes}
                        </h4>
                        <textarea
                            className="w-full p-3 rounded-xl bg-green-50 border border-green-100 text-sm focus:outline-none focus:border-green-500 min-h-[100px]"
                            placeholder={text.placeholderNotes}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        />
                        <button 
                            onClick={handleNoteSave}
                            className="mt-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700 w-full"
                        >
                            {text.saveNote}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};