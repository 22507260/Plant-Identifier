import React, { useState, useEffect, useRef } from 'react';
import { startChat, sendMessageToChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Message, Language, Reminder } from '../types';
import { MarkdownText } from './MarkdownText';

interface ChatViewProps {
  lang: Language;
}

const UI_TEXT = {
  en: {
    header: 'Garden Chat',
    placeholder: 'Ask about your plants...',
    welcome: "Hello! I'm GreenThumb. Ask me anything about your garden, houseplants, or pest control.",
    remindersTitle: 'Scheduled Reminders',
    noReminders: 'No active reminders.',
    delete: 'Delete',
    due: 'Due',
  },
  tr: {
    header: 'Bahçe Sohbeti',
    placeholder: 'Bitkileriniz hakkında sorun...',
    welcome: "Merhaba! Ben GreenThumb. Bana bahçeniz, ev bitkileriniz veya zararlılarla mücadele hakkında her şeyi sorabilirsiniz.",
    remindersTitle: 'Planlanan Hatırlatıcılar',
    noReminders: 'Aktif hatırlatıcı yok.',
    delete: 'Sil',
    due: 'Bitiş',
  }
};

export const ChatView: React.FC<ChatViewProps> = ({ lang }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const text = UI_TEXT[lang];

  const loadReminders = () => {
    try {
      const stored = localStorage.getItem('green_thumb_reminders');
      if (stored) {
        const parsed: Reminder[] = JSON.parse(stored);
        // Filter out past reminders if desired, or just show all
        setReminders(parsed.sort((a, b) => a.dueDate - b.dueDate));
      }
    } catch (e) {
      console.error("Failed to load reminders", e);
    }
  };

  useEffect(() => {
    // Initialize chat session on mount or when language changes
    chatSessionRef.current = startChat(lang);
    
    // Reset messages with new language welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: text.welcome,
        timestamp: Date.now(),
      },
    ]);

    // Load reminders
    loadReminders();

    // Listen for custom event from geminiService
    const handleReminderAdded = () => {
      loadReminders();
      // Optional: Show a subtle toast or badge update here
    };

    window.addEventListener('reminderAdded', handleReminderAdded);
    return () => {
      window.removeEventListener('reminderAdded', handleReminderAdded);
    };
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSessionRef.current || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToChat(chatSessionRef.current, userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      // Handle error gracefully in UI if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('green_thumb_reminders', JSON.stringify(updated));
  };

  const formatDueDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-4 pt-12 border-b border-green-100 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
           <span className="material-symbols-rounded text-green-600">psychiatry</span>
           {text.header}
        </h2>
        <button 
          onClick={() => setShowReminders(!showReminders)}
          className={`p-2 rounded-full transition-colors relative ${showReminders ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
           <span className="material-symbols-rounded">notifications</span>
           {reminders.length > 0 && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
           )}
        </button>
      </div>

      {/* Reminders Modal/Overlay */}
      {showReminders && (
        <div className="absolute top-[80px] left-0 right-0 bottom-20 z-20 bg-black/5 backdrop-blur-sm animate-fade-in" onClick={() => setShowReminders(false)}>
           <div 
             className="absolute top-0 right-4 w-72 bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden flex flex-col max-h-[60%]"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-4 border-b border-green-50 bg-green-50/50 flex justify-between items-center">
                 <h3 className="font-bold text-green-900 text-sm">{text.remindersTitle}</h3>
                 <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">{reminders.length}</span>
              </div>
              <div className="overflow-y-auto p-2">
                 {reminders.length === 0 ? (
                   <p className="text-gray-400 text-sm text-center py-6">{text.noReminders}</p>
                 ) : (
                   <div className="space-y-2">
                      {reminders.map(rem => (
                        <div key={rem.id} className="bg-white border border-green-100 p-3 rounded-xl shadow-sm flex flex-col gap-1 relative group">
                           <div className="flex justify-between items-start">
                             <span className="font-semibold text-gray-800 text-sm">{rem.action}</span>
                             <button 
                                onClick={() => deleteReminder(rem.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                             >
                               <span className="material-symbols-rounded text-lg">delete</span>
                             </button>
                           </div>
                           <span className="text-xs text-green-600 font-medium">{rem.plantName}</span>
                           <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <span className="material-symbols-rounded text-[10px]">schedule</span>
                              {formatDueDate(rem.dueDate)}
                           </span>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-green-50 text-gray-800 rounded-bl-none border border-green-100'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <MarkdownText content={msg.text} className={msg.role === 'user' ? 'text-white prose-invert' : ''} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-green-50 rounded-2xl rounded-bl-none p-4 border border-green-100 flex gap-2 items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom above nav */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-green-100">
        <div className="flex gap-2 items-end bg-gray-50 p-2 rounded-3xl border border-gray-200 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={text.placeholder}
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-gray-800 placeholder-gray-400"
            rows={1}
            style={{ height: 'auto' }} 
            onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-full flex-shrink-0 transition-colors ${
              !inputText.trim() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
            }`}
          >
            <span className="material-symbols-rounded text-xl block">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};