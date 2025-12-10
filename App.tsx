import React, { useState, useEffect } from 'react';
import { AnalyzeView } from './components/AnalyzeView';
import { ChatView } from './components/ChatView';
import { GardenView } from './components/GardenView';
import { AppView, Language } from './types';
import { getSavedPlants } from './services/storageService';

const UI_TEXT = {
  en: {
    identify: 'Identify',
    chat: 'Chat',
    garden: 'My Garden',
    thirstyTitle: 'Thirsty Plants!',
    thirstyBody: (name: string, days: number) => `${name} needs water! It's been ${days} days overdue.`
  },
  tr: {
    identify: 'Tanıla',
    chat: 'Sohbet',
    garden: 'Bahçem',
    thirstyTitle: 'Bitkileriniz Susadı!',
    thirstyBody: (name: string, days: number) => `${name} sulama bekliyor! ${days} gün gecikti.`
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ANALYZE);
  const [language, setLanguage] = useState<Language>('en');

  const text = UI_TEXT[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'tr' : 'en');
  };

  // Notification Logic
  useEffect(() => {
    const checkWateringNeeds = async () => {
      // 1. Request Permission
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }

      // 2. Check Plants
      if ('Notification' in window && Notification.permission === 'granted') {
        // getSavedPlants is now async due to IndexedDB migration
        const plants = await getSavedPlants();
        const now = Date.now();
        
        plants.forEach(plant => {
          if (plant.wateringInterval && plant.lastWatered) {
            const nextWatering = plant.lastWatered + (plant.wateringInterval * 24 * 60 * 60 * 1000);
            
            // If overdue by more than 1 hour (to avoid instant notification after setting)
            if (now > nextWatering + (60 * 60 * 1000)) {
               const overdueMs = now - nextWatering;
               const overdueDays = Math.ceil(overdueMs / (1000 * 60 * 60 * 24));
               
               // Check if we already notified recently? (Simplification: Just notify on app load)
               // In a real PWA, this would be a background worker.
               new Notification(text.thirstyTitle, {
                 body: text.thirstyBody(plant.name, overdueDays),
                 icon: '/potted_plant.png' // Fallback icon
               });
            }
          }
        });
      }
    };

    checkWateringNeeds();
    
    // Check again every hour if app is left open
    const interval = setInterval(checkWateringNeeds, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [language]);

  const renderView = () => {
    switch (currentView) {
      case AppView.ANALYZE:
        return <AnalyzeView lang={language} onToggleLanguage={toggleLanguage} />;
      case AppView.CHAT:
        return <ChatView lang={language} />;
      case AppView.GARDEN:
        return <GardenView lang={language} />;
      default:
        return <AnalyzeView lang={language} onToggleLanguage={toggleLanguage} />;
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col relative overflow-hidden">
      
      {/* Language Toggle - Fixed Absolute Top Right (Main Screen) */}
      <div className="absolute top-4 right-4 z-[100]">
        <button 
          onClick={toggleLanguage}
          className="bg-white/80 backdrop-blur-md border border-green-200 shadow-sm rounded-full px-3 py-1 text-xs font-bold text-green-800 flex items-center gap-1 hover:bg-green-50 transition-colors"
        >
          <span className="material-symbols-rounded text-sm">language</span>
          {language === 'en' ? 'EN' : 'TR'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderView()}
      </div>

      {/* Bottom Navigation Tab Bar */}
      <div className="h-[80px] bg-white border-t border-green-100 flex justify-between px-6 items-start pt-3 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setCurrentView(AppView.ANALYZE)}
          className={`flex flex-col items-center gap-1 w-20 transition-colors ${
            currentView === AppView.ANALYZE ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
          }`}
        >
          <div className={`p-1 rounded-full ${currentView === AppView.ANALYZE ? 'bg-green-100' : ''}`}>
             <span className="material-symbols-rounded text-2xl">document_scanner</span>
          </div>
          <span className="text-xs font-medium">{text.identify}</span>
        </button>

        <button
          onClick={() => setCurrentView(AppView.GARDEN)}
          className={`flex flex-col items-center gap-1 w-20 transition-colors ${
            currentView === AppView.GARDEN ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
          }`}
        >
          <div className={`p-1 rounded-full ${currentView === AppView.GARDEN ? 'bg-green-100' : ''}`}>
            <span className="material-symbols-rounded text-2xl">potted_plant</span>
          </div>
          <span className="text-xs font-medium">{text.garden}</span>
        </button>

        <button
          onClick={() => setCurrentView(AppView.CHAT)}
          className={`flex flex-col items-center gap-1 w-20 transition-colors ${
            currentView === AppView.CHAT ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
          }`}
        >
          <div className={`p-1 rounded-full ${currentView === AppView.CHAT ? 'bg-green-100' : ''}`}>
            <span className="material-symbols-rounded text-2xl">voice_chat</span>
          </div>
          <span className="text-xs font-medium">{text.chat}</span>
        </button>
      </div>
    </div>
  );
};

export default App;