import React, { useState, useRef, useEffect } from 'react';
import { analyzePlantImage, searchPlantGuide } from '../services/geminiService';
import { savePlantToGarden } from '../services/storageService';
import { MarkdownText } from './MarkdownText';
import { Language } from '../types';

const COMMON_PLANTS_DATA = {
  en: [
    {
      name: 'Monstera',
      subtitle: 'Swiss Cheese Plant',
      icon: '🌿',
      tags: ['indoor', 'foliage'],
      content: `# Monstera Deliciosa
**Common Name:** Swiss Cheese Plant
**Scientific Name:** *Monstera deliciosa*

### 💧 Water Needs
Water every 7-14 weeks, allowing soil to dry out between waterings. Expect to water more often in brighter light and less often in lower light.

### ☀️ Sunlight Needs
Thrives in bright to medium indirect light. Not suited for intense, direct sun but can be acclimated to withstand it.

### 🖐️ Top 5 Care Tips
1. **Soil:** Use a well-draining potting mix rich in peat or coco coir.
2. **Humidity:** Prefers high humidity. Mist occasionally or use a humidifier.
3. **Pruning:** Prune to shape and remove dead or yellowing leaves.
4. **Support:** Provide a moss pole for aerial roots to climb as it grows.
5. **Cleaning:** Wipe dust off leaves regularly to help photosynthesis.

### 🌱 How to Grow
**Propagation:** Easily propagated by stem cuttings with a node. Place in water or soil.
**Soil:** Aroid mix (chunky, well-draining).
**Conditions:** Warm and humid environment.

### 💚 Benefits
Air purifying, aesthetically pleasing, improves indoor humidity.

### ⚠️ Harms & Toxicity
**Toxic to pets and humans if ingested.** Calcium oxalate crystals cause irritation to mouth and stomach.
`
    },
    {
      name: 'Snake Plant',
      subtitle: 'Indestructible',
      icon: '🐍',
      tags: ['indoor', 'succulent'],
      content: `# Snake Plant
**Common Name:** Mother-in-Law's Tongue
**Scientific Name:** *Dracaena trifasciata*

### 💧 Water Needs
Water every 14-21 weeks, allowing soil to dry out completely between waterings.

### ☀️ Sunlight Needs
Thrives in any light level, from low light to bright indirect light.

### 🖐️ Top 5 Care Tips
1. **Soil:** Free-draining soil (cactus/succulent mix) is essential to prevent rot.
2. **Hardiness:** Very hardy; neglect is often better than too much attention.
3. **Watering:** Do not water if the soil is even slightly moist.
4. **Temperature:** Keep above 50°F (10°C); they dislike cold drafts.
5. **Repotting:** They like being pot-bound, so don't rush to repot often.

### 🌱 How to Grow
**Propagation:** Leaf cuttings or dividing rhizomes.
**Soil:** Sandy, free-draining cactus mix.
**Conditions:** Tolerates low humidity and wide temperature range.

### 💚 Benefits
Excellent air purifier (removes toxins like formaldehyde and benzene), releases oxygen at night.

### ⚠️ Harms & Toxicity
**Toxic to cats and dogs.** Causes nausea, vomiting, and diarrhea if ingested.
`
    },
    {
      name: 'Peace Lily',
      subtitle: 'Air Purifying',
      icon: '🕊️',
      tags: ['indoor', 'flowering'],
      content: `# Peace Lily
**Common Name:** Peace Lily
**Scientific Name:** *Spathiphyllum*

### 💧 Water Needs
Water every 5-7 days. Keep soil moist but not soggy. They droop dramatically when thirsty!

### ☀️ Sunlight Needs
Thrives in medium to low indirect light. Avoid direct sun which burns leaves.

### 🖐️ Top 5 Care Tips
1. **Toxicity:** Toxic to cats and dogs if ingested; keep out of reach.
2. **Flowering:** Produces white spathes; higher light encourages more blooms.
3. **Water Quality:** Sensitive to chlorine; use filtered or distilled water if tips brown.
4. **Humidity:** Loves humidity; misting leaves helps prevent pests.
5. **Cleaning:** Wipe leaves to remove dust and improve breathing.

### 🌱 How to Grow
**Propagation:** Division of clumps during repotting.
**Soil:** Peat-based potting mix.
**Conditions:** Consistent moisture and warmth.

### 💚 Benefits
One of the top air-purifying plants (removes ammonia, benzene, formaldehyde).

### ⚠️ Harms & Toxicity
**Mildly toxic.** Ingestion causes mouth irritation, drooling, and difficulty swallowing.
`
    },
    {
      name: 'Aloe Vera',
      subtitle: 'Healing Succulent',
      icon: '🌵',
      tags: ['indoor', 'succulent', 'medicinal'],
      content: `# Aloe Vera
**Common Name:** Aloe Vera
**Scientific Name:** *Aloe barbadensis miller*

### 💧 Water Needs
Water every 21 days (3 weeks). Water deeply but infrequently. Allow the top 1-2 inches of soil to dry completely between waterings.

### ☀️ Sunlight Needs
Needs bright, sunny conditions. Direct sunlight is best for vigorous growth.

### 🖐️ Top 5 Care Tips
1. **Soil:** Use a cactus or succulent mix with plenty of perlite.
2. **Harvesting:** Lower leaves can be harvested for their soothing gel.
3. **Drainage:** Ensure the pot has a drainage hole to prevent root rot.
4. **Placement:** A south or west-facing window is usually ideal.
5. **Stability:** Heavy leaves can tip pots; use a heavy pot (like terracotta).

### 🌱 How to Grow
**Propagation:** Offsets (pups) that grow from the base.
**Soil:** Succulent/Cactus mix.
**Conditions:** Bright light, dry air.

### 💚 Benefits
Gel soothes burns and skin irritations; air purifying.

### ⚠️ Harms & Toxicity
**Latex (yellow layer under skin) is toxic if ingested.** Gel is generally safe for external use. Toxic to pets.
`
    }
  ],
  tr: [
    {
      name: 'Deve Tabanı',
      subtitle: 'Monstera',
      icon: '🌿',
      tags: ['indoor', 'foliage'],
      content: `# Deve Tabanı (Monstera)
**Yaygın Ad:** Deve Tabanı (Swiss Cheese Plant)
**Bilimsel Ad:** *Monstera deliciosa*

### 💧 Su İhtiyacı
Toprağın kurumasına izin vererek her 7-14 günde bir sulayın. Daha parlak ışıkta daha sık, düşük ışıkta daha az sulama bekleyin.

### ☀️ Güneş Işığı İhtiyacı
Parlak ila orta düzeyde dolaylı ışıkta gelişir. Yoğun, doğrudan güneş için uygun değildir ancak alıştırılabilir.

### 🖐️ En Önemli 5 Bakım İpucu
1. **Toprak:** İyi drene olan, turba açısından zengin bir saksı toprağı kullanın.
2. **Nem:** Yüksek nemi sever. Arada bir spreyleyin veya nemlendirici kullanın.
3. **Budama:** Şekil vermek ve ölü yaprakları temizlemek için budayın.
4. **Destek:** Büyürken hava köklerinin tırmanması için yosun çubuğu sağlayın.
5. **Temizlik:** Fotosenteze yardımcı olmak için yaprakların tozunu düzenli olarak silin.

### 🌱 Nasıl Yetiştirilir
**Çoğaltma:** Boğumlu gövde çelikleri ile suda veya toprakta kolayca çoğaltılır.
**Toprak:** Aroid karışımı (iri taneli, iyi süzülen).
**Koşullar:** Sıcak ve nemli ortam.

### 💚 Yararlar
Hava temizleyici, estetik görünüm, iç mekan nemini artırır.

### ⚠️ Zararlar ve Toksisite
**Yutulması halinde evcil hayvanlar ve insanlar için zehirlidir.** Kalsiyum oksalat kristalleri ağız ve midede tahrişe neden olur.
`
    },
    {
      name: 'Paşa Kılıcı',
      subtitle: 'Dayanıklı',
      icon: '🐍',
      tags: ['indoor', 'succulent'],
      content: `# Paşa Kılıcı (Snake Plant)
**Yaygın Ad:** Paşa Kılıcı (Mother-in-Law's Tongue)
**Bilimsel Ad:** *Dracaena trifasciata*

### 💧 Su İhtiyacı
Toprağın sulamalar arasında tamamen kurumasına izin vererek her 14-21 günde bir sulayın.

### ☀️ Güneş Işığı İhtiyacı
Düşük ışıktan parlak dolaylı ışığa kadar her türlü ışık seviyesinde gelişir.

### 🖐️ En Önemli 5 Bakım İpucu
1. **Toprak:** Çürümeyi önlemek için hızlı süzülen (kaktüs/sukulent) toprak şarttır.
2. **Dayanıklılık:** Çok dayanıklıdır; ihmal etmek genellikle aşırı ilgiden iyidir.
3. **Sulama:** Toprak hafif nemliyse bile sulamayın.
4. **Sıcaklık:** 10°C'nin üzerinde tutun; soğuk hava akımlarını sevmezler.
5. **Saksı:** Köklerinin sıkışık olmasını severler, sık sık saksı değiştirmeyin.

### 🌱 Nasıl Yetiştirilir
**Çoğaltma:** Yaprak çelikleri veya kök saplarının ayrılması ile.
**Toprak:** Kumlu, iyi süzülen kaktüs karışımı.
**Koşullar:** Düşük neme ve geniş sıcaklık aralıklarına dayanır.

### 💚 Yararlar
Mükemmel hava temizleyici (formaldehit ve benzen gibi toksinleri giderir), geceleri oksijen salgılar.

### ⚠️ Zararlar ve Toksisite
**Kedi ve köpekler için zehirlidir.** Yutulması halinde mide bulantısı, kusma ve ishale neden olur.
`
    },
    {
      name: 'Barış Çiçeği',
      subtitle: 'Hava Temizleyici',
      icon: '🕊️',
      tags: ['indoor', 'flowering'],
      content: `# Barış Çiçeği (Peace Lily)
**Yaygın Ad:** Barış Çiçeği (Yelken Çiçeği)
**Bilimsel Ad:** *Spathiphyllum*

### 💧 Su İhtiyacı
Her 5-7 günde bir sulayın. Toprağı nemli tutun ancak ıslak değil. Susadıklarında yapraklarını belirgin şekilde bükerler!

### ☀️ Güneş Işığı İhtiyacı
Orta ila düşük dolaylı ışıkta gelişir. Yaprakları yakan doğrudan güneşten kaçının.

### 🖐️ En Önemli 5 Bakım İpucu
1. **Uyarı:** Yutulması halinde kedi ve köpekler için zehirlidir; ulaşamayacakları yerde tutun.
2. **Çiçeklenme:** Beyaz çiçekler üretir; daha fazla ışık daha çok çiçek teşvik eder.
3. **Su Kalitesi:** Klora karşı hassastır; uçlar kahverengileşirse arıtılmış su kullanın.
4. **Nem:** Nemi sever; yaprakları spreylemek zararlıları önlemeye yardımcı olur.
5. **Temizlik:** Tozu almak ve nefes almasını sağlamak için yaprakları silin.

### 🌱 Nasıl Yetiştirilir
**Çoğaltma:** Saksı değişimi sırasında köklerin ayrılması ile.
**Toprak:** Turba bazlı saksı karışımı.
**Koşullar:** Sürekli nem ve sıcaklık.

### 💚 Yararlar
En iyi hava temizleyen bitkilerden biridir (amonyak, benzen, formaldehiti giderir).

### ⚠️ Zararlar ve Toksisite
**Hafif zehirlidir.** Yutulması ağızda tahrişe, salya akmasına ve yutma güçlüğüne neden olur.
`
    },
    {
      name: 'Aloe Vera',
      subtitle: 'Şifalı Sukulent',
      icon: '🌵',
      tags: ['indoor', 'succulent', 'medicinal'],
      content: `# Aloe Vera
**Yaygın Ad:** Aloe Vera (Sarısabır)
**Bilimsel Ad:** *Aloe barbadensis miller*

### 💧 Su İhtiyacı
Derinlemesine ancak seyrek sulayın. Sulamalar arasında toprağın üst 3-5 cm'lik kısmının tamamen kurumasına izin verin (her 21 günde bir).

### ☀️ Güneş Işığı İhtiyacı
Parlak, güneşli koşullara ihtiyaç duyar. Güçlü büyüme için doğrudan güneş ışığı en iyisidir.

### 🖐️ En Önemli 5 Bakım İpucu
1. **Toprak:** Bol perlitli kaktüs veya sukulent karışımı kullanın.
2. **Hasat:** Alt yapraklar yatıştırıcı jelleri için hasat edilebilir.
3. **Drenaj:** Kök çürümesini önlemek için saksının drenaj deliği olduğundan emin olun.
4. **Konum:** Güney veya batı cepheli bir pencere genellikle idealdir.
5. **Denge:** Ağır yapraklar saksıyı devirebilir; ağır bir saksı (toprak saksı gibi) kullanın.

### 🌱 Nasıl Yetiştirilir
**Çoğaltma:** Tabandan büyüyen yavruların ayrılması ile.
**Toprak:** Sukulent/Kaktüs karışımı.
**Koşullar:** Parlak ışık, kuru hava.

### 💚 Yararlar
Jeli yanıkları ve cilt tahrişlerini yatıştırır; hava temizleyicidir.

### ⚠️ Zararlar ve Toksisite
**Lateks (kabuk altındaki sarı tabaka) yutulursa zehirlidir.** Jel genellikle harici kullanım için güvenlidir. Evcil hayvanlar için zehirlidir.
`
    }
  ]
};

const UI_TEXT = {
  en: {
    title: 'Plant Identifier',
    subtitle: 'Snap a photo or describe your plant.',
    uploadText: 'Take Photo or Upload',
    dragDropHint: 'or drag and drop image here',
    dropHere: 'Drop image to upload',
    analyzing: 'Analyzing...',
    identify: 'Identify Plant',
    diagnose: 'Diagnose Disease',
    resultTitle: 'Analysis Result',
    guideTitle: 'Plant Guide',
    commonGuides: 'Popular Plant Guides',
    error: 'Sorry, something went wrong while analyzing. Please try again.',
    listening: 'Listening...',
    speakNow: 'Speak now...',
    addVoiceNote: 'Add Voice Note',
    searchPlaceholder: 'Search plant guides...',
    noResults: 'No local guides found.',
    searchWeb: 'Search Web for',
    generatingGuide: 'Generating guide from web...',
    feedbackQuestion: 'Was this helpful?',
    feedbackThanks: 'Thanks for your feedback!',
    personalNotes: 'Personal Notes',
    placeholderNotes: 'Add your own care notes here (e.g. "Watered on Monday")...',
    saveNote: 'Save Note',
    saved: 'Saved!',
    saving: 'Saving...',
    addToGarden: 'Add to My Garden',
    addedToGarden: 'Added to Garden',
    scheduleTitle: 'Watering Schedule',
    schedulePrompt: (days: number) => `I found a recommended watering frequency of every ${days} days. Do you want to use this?`,
    useRec: 'Yes, Use Recommendation',
    setManual: 'No, Set Manually',
    manualLabel: 'Water every:',
    daysLabel: 'days',
    confirmSave: 'Save Plant',
    useCamera: 'Open Camera',
    snapPhoto: 'Take Photo',
    cameraError: 'Camera access denied or not available.',
    uploadFile: 'Upload Image',
    modeIdentify: 'Identify',
    modeDiagnose: 'Diagnose',
  },
  tr: {
    title: 'Bitki Tanımlayıcı',
    subtitle: 'Fotoğraf çekin veya bitkinizi tarif edin.',
    uploadText: 'Fotoğraf Çek veya Yükle',
    dragDropHint: 'veya resmi buraya sürükleyin',
    dropHere: 'Yüklemek için bırakın',
    analyzing: 'Analiz ediliyor...',
    identify: 'Bitkiyi Tanımla',
    diagnose: 'Hastalık Teşhisi',
    resultTitle: 'Analiz Sonucu',
    guideTitle: 'Bitki Rehberi',
    commonGuides: 'Popüler Bitki Rehberleri',
    error: 'Üzgünüm, analiz sırasında bir sorun oluştu. Lütfen tekrar deneyin.',
    listening: 'Dinleniyor...',
    speakNow: 'Şimdi konuşun...',
    addVoiceNote: 'Ses Notu Ekle',
    searchPlaceholder: 'Bitki rehberlerinde ara...',
    noResults: 'Yerel rehber bulunamadı.',
    searchWeb: 'Web\'de Ara:',
    generatingGuide: 'Web\'den rehber oluşturuluyor...',
    feedbackQuestion: 'Bu yardımcı oldu mu?',
    feedbackThanks: 'Geri bildiriminiz için teşekkürler!',
    personalNotes: 'Kişisel Notlar',
    placeholderNotes: 'Kendi bakım notlarınızı buraya ekleyin (örn. "Pazartesi sulandı")...',
    saveNote: 'Notu Kaydet',
    saved: 'Kaydedildi!',
    saving: 'Kaydediliyor...',
    addToGarden: 'Bahçeme Ekle',
    addedToGarden: 'Bahçeye Eklendi',
    scheduleTitle: 'Sulama Takvimi',
    schedulePrompt: (days: number) => `Her ${days} günde bir sulama önerisi buldum. Bunu kullanmak ister misiniz?`,
    useRec: 'Evet, Öneriyi Kullan',
    setManual: 'Hayır, Manuel Ayarla',
    manualLabel: 'Sulama sıklığı:',
    daysLabel: 'gün',
    confirmSave: 'Bitkiyi Kaydet',
    useCamera: 'Kamerayı Aç',
    snapPhoto: 'Fotoğraf Çek',
    cameraError: 'Kameraya erişilemedi.',
    uploadFile: 'Resim Yükle',
    modeIdentify: 'Tanımla',
    modeDiagnose: 'Teşhis Et',
  }
};

const FILTERS = {
  en: [
    { id: 'all', label: 'All' },
    { id: 'indoor', label: 'Indoor' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'succulent', label: 'Succulent' },
    { id: 'flowering', label: 'Flowering' },
  ],
  tr: [
    { id: 'all', label: 'Tümü' },
    { id: 'indoor', label: 'İç Mekan' },
    { id: 'outdoor', label: 'Dış Mekan' },
    { id: 'succulent', label: 'Sukulent' },
    { id: 'flowering', label: 'Çiçekli' },
  ]
};

interface ImageZoomModalProps {
  src: string;
  onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialScaleRef = useRef(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPosRef.current = { ...position };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      initialPinchDistRef.current = getDistance(e.touches);
      initialScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - startPosRef.current.x;
      const dy = e.touches[0].clientY - startPosRef.current.y;
      setPosition({
        x: lastPosRef.current.x + dx,
        y: lastPosRef.current.y + dy
      });
    } else if (e.touches.length === 2 && initialPinchDistRef.current) {
      const currentDist = getDistance(e.touches);
      const ratio = currentDist / initialPinchDistRef.current;
      const newScale = Math.min(Math.max(1, initialScaleRef.current * ratio), 5);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    initialPinchDistRef.current = null;
    if (scale < 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    lastPosRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      setPosition({
        x: lastPosRef.current.x + dx,
        y: lastPosRef.current.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const zoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-[250] flex flex-col animate-fade-in touch-none">
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-end">
        <button 
          onClick={onClose}
          className="bg-black/40 text-white rounded-full p-2 hover:bg-white/20 backdrop-blur-md transition-colors"
        >
          <span className="material-symbols-rounded text-2xl">close</span>
        </button>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-move"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt="Zoomed plant"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="max-w-full max-h-full object-contain select-none pointer-events-none"
        />
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 z-50 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={zoomOut}
            className="text-white hover:text-green-400 disabled:opacity-50 p-1"
            disabled={scale <= 1}
          >
            <span className="material-symbols-rounded">remove</span>
          </button>
          <span className="text-white font-medium min-w-[3ch] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="text-white hover:text-green-400 disabled:opacity-50 p-1"
            disabled={scale >= 5}
          >
            <span className="material-symbols-rounded">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface AnalyzeViewProps {
  lang: Language;
  onToggleLanguage?: () => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ lang, onToggleLanguage }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [feedbackStatus, setFeedbackStatus] = useState<'none' | 'liked' | 'disliked'>('none');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSavedToGarden, setIsSavedToGarden] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'identify' | 'diagnose'>('identify');
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // States for tracking content source and ensuring correct translation
  const [resultSource, setResultSource] = useState<'analyze' | 'search' | 'guide' | null>(null);
  const [selectedGuideIndex, setSelectedGuideIndex] = useState<number>(-1);
  const [lastQuery, setLastQuery] = useState('');
  
  // Note states
  const [noteText, setNoteText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Schedule Setup Modal States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [suggestedDays, setSuggestedDays] = useState<number | null>(null);
  const [manualDays, setManualDays] = useState(7);
  const [isManualSchedule, setIsManualSchedule] = useState(false);

  // Ref to skip auto-save on initial load
  const isNotesLoadedRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = UI_TEXT[lang];
  const commonPlants = COMMON_PLANTS_DATA[lang];
  const filters = FILTERS[lang];

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isCameraOpen) {
      const initCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera error:", err);
          setIsCameraOpen(false);
          alert(text.cameraError);
        }
      };
      
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, text.cameraError]);

  const startCamera = () => {
    setIsCameraOpen(true);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
       const canvas = document.createElement('canvas');
       canvas.width = videoRef.current.videoWidth;
       canvas.height = videoRef.current.videoHeight;
       const ctx = canvas.getContext('2d');
       if (ctx) {
           ctx.drawImage(videoRef.current, 0, 0);
           const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
           setSelectedImage(dataUrl);
           setResult(null);
           setFeedbackStatus('none');
           setFeedbackMessage(null);
           stopCamera();
       }
    }
  };

  // Filter local plants based on search query AND active filter type
  const filteredPlants = commonPlants.filter(plant => {
    const matchesSearch = 
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      plant.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || (plant.tags && plant.tags.includes(activeFilter));
    
    return matchesSearch && matchesFilter;
  });

  // Helper to extract plant name for cache key
  const getPlantNameFromMarkdown = (markdownContent: string): string => {
    // Looks for first header # Name
    const match = markdownContent.match(/^#\s*(.+)$/m);
    return match ? match[1].trim() : 'Unknown Plant';
  };

  // Helper to extract recommended watering days from Markdown
  const extractWateringDays = (content: string): number | null => {
    const lower = content.toLowerCase();
    
    // Simplistic extraction: Look for "water" header section then find first digit pattern
    const waterSectionMatch = lower.match(/(?:### 💧|water needs|su ihtiyacı)([\s\S]*?)(?:###|$)/i);
    if (!waterSectionMatch) return null;
    
    const waterText = waterSectionMatch[1];
    
    // Try to find "X days" or "X gün"
    const daysMatch = waterText.match(/(\d+)\s*-?\s*\d*\s*(?:days|gün)/i);
    if (daysMatch) {
        return parseInt(daysMatch[1]);
    }

    // Try to find "X weeks" or "X hafta" -> multiply by 7
    const weeksMatch = waterText.match(/(\d+)\s*-?\s*\d*\s*(?:weeks|hafta)/i);
    if (weeksMatch) {
        return parseInt(weeksMatch[1]) * 7;
    }

    return null;
  };

  // Helper to extract Soil Type
  const extractSoilType = (content: string): string | undefined => {
    // Looks for "**Soil:** ..." pattern inside the markdown
    const match = content.match(/\*\*Soil:\*\*\s*(.+?)(?:\n|$)/i) || 
                  content.match(/\*\*Toprak:\*\*\s*(.+?)(?:\n|$)/i);
    return match ? match[1].trim() : undefined;
  };

  // Load notes when result changes
  useEffect(() => {
    if (result) {
      const key = getPlantNameFromMarkdown(result);
      // Clean previous temporary states
      setNoteText(''); 
      setSaveStatus('idle');
      setIsSavedToGarden(false);
      setShowScheduleModal(false);
      isNotesLoadedRef.current = true;
    }
  }, [result]);

  // Effect to re-generate content when language changes while viewing a result
  useEffect(() => {
    if (!result || isAnalyzing) return;

    const regenerateContent = async () => {
       setIsAnalyzing(true);
       if (resultSource === 'guide' && selectedGuideIndex >= 0) {
           setResult(commonPlants[selectedGuideIndex].content);
           setIsAnalyzing(false);
       } else if (resultSource === 'analyze' && (selectedImage || voiceText)) {
           await handleAnalyze();
       } else if (resultSource === 'search' && lastQuery) {
           await performWebSearch(lastQuery);
       } else {
           setIsAnalyzing(false);
       }
    };

    regenerateContent();
  }, [lang]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setResult(null);
        setFeedbackStatus('none');
        setFeedbackMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setResult(null);
        setFeedbackStatus('none');
        setFeedbackMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        setResult(null); // Clear previous results if new input
        setFeedbackStatus('none');
        setFeedbackMessage(null);
      };
      
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !voiceText) return;

    setIsAnalyzing(true);
    setResultSource('analyze');
    setFeedbackStatus('none');
    setFeedbackMessage(null);
    try {
      // Remove data:image/jpeg;base64, prefix for the API if image exists
      const base64Data = selectedImage ? selectedImage.split(',')[1] : null;
      // Pass the analysisMode here
      const analysisResult = await analyzePlantImage(base64Data, lang, voiceText, analysisMode);
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      setResult(text.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performWebSearch = async (query: string) => {
    setIsAnalyzing(true);
    setResultSource('search');
    // REMOVED: setResult(null) to prevent modal closing during regeneration
    setFeedbackStatus('none');
    setFeedbackMessage(null);
    
    try {
      const selectedFilterObj = filters.find(f => f.id === activeFilter);
      const filterLabel = selectedFilterObj ? selectedFilterObj.label : undefined;
      const filterToPass = activeFilter === 'all' ? undefined : filterLabel;

      const searchResult = await searchPlantGuide(query, lang, filterToPass);
      setResult(searchResult);
    } catch (error) {
      console.error(error);
      setResult(text.error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setLastQuery(searchQuery);
    setSelectedImage(null);
    setVoiceText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    await performWebSearch(searchQuery);
    setSearchQuery(''); 
  };

  // Step 1: User clicks "Add to Garden". Check for suggestion.
  const initiateSaveFlow = () => {
    if (!result) return;
    const extracted = extractWateringDays(result);
    
    if (extracted) {
      setSuggestedDays(extracted);
      setManualDays(extracted); // Pre-fill manual with suggestion just in case
      setIsManualSchedule(false);
      setShowScheduleModal(true);
    } else {
      // No suggestion found, go straight to manual setup (or default)
      setSuggestedDays(null);
      setManualDays(7);
      setIsManualSchedule(true);
      setShowScheduleModal(true);
    }
  };

  const confirmSchedule = (useSuggested: boolean) => {
      if (useSuggested && suggestedDays) {
          executeSave(suggestedDays);
      } else {
          setIsManualSchedule(true);
      }
  };

  const saveManual = () => {
      executeSave(manualDays);
  }

  const executeSave = async (days: number) => {
    if (!result) return;
    setShowScheduleModal(false);
    setSaveStatus('saving');
    
    const plantName = getPlantNameFromMarkdown(result);
    const extractedSoil = extractSoilType(result);
    
    try {
        await savePlantToGarden({
            name: plantName,
            analysisResult: result,
            imageBase64: selectedImage || null,
            personalNotes: noteText || undefined,
            soilType: extractedSoil, // Auto-save extracted soil type
            wateringInterval: days,
            lastWatered: Date.now() // Assume watered today upon saving
        });
        
        setIsSavedToGarden(true);
        setSaveStatus('saved');

        // Request notification permission if not already done
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    } catch (error) {
        console.error("Failed to save", error);
        alert(lang === 'tr' ? 'Depolama alanı dolu. Lütfen bazı bitkileri silin.' : 'Storage full. Please delete some plants.');
        setSaveStatus('idle');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearVoiceText = () => {
    setVoiceText('');
  }

  const handleGuideSelect = (index: number) => {
    const content = commonPlants[index].content;
    setSelectedImage(null);
    setVoiceText('');
    setResultSource('guide');
    setSelectedGuideIndex(index);
    setResult(content);
    setFeedbackStatus('none');
    setFeedbackMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleFeedback = (type: 'liked' | 'disliked') => {
    setFeedbackStatus(type);
    setFeedbackMessage(text.feedbackThanks);
    
    const lines = result?.split('\n') || [];
    const firstLine = lines.find(line => line.trim().startsWith('#')) || lines[0] || '';
    const plantName = firstLine.replace(/^#+\s*/, '').trim() || 'Unknown Plant';

    console.log(`User feedback: ${type === 'liked' ? 'Thumbs Up' : 'Thumbs Down'} for plant: ${plantName}`);

    setTimeout(() => {
        setFeedbackStatus('none');
        setFeedbackMessage(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-green-50 relative">
      {showZoom && selectedImage && (
        <ImageZoomModal 
          src={selectedImage} 
          onClose={() => setShowZoom(false)} 
        />
      )}
      
      {isListening && (
        <div className="fixed inset-0 z-[300] bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
               <span className="material-symbols-rounded text-white text-4xl">mic</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{text.listening}</p>
            <p className="text-gray-500">{text.speakNow}</p>
          </div>
        </div>
      )}

      {/* Main Content / Input Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-12 pb-24 scroll-smooth">
        <h2 className="text-2xl font-bold text-green-900 mb-2">{text.title}</h2>
        <p className="text-green-700 mb-6 text-sm">{text.subtitle}</p>

        {/* Upload Area */}
        <div className="mb-6 space-y-4">
            
            {/* Mode Toggle */}
            <div className="flex bg-white rounded-full p-1 border border-green-200 shadow-sm mb-2">
                <button 
                    onClick={() => setAnalysisMode('identify')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                        analysisMode === 'identify' 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-gray-500 hover:text-green-600'
                    }`}
                >
                    {text.modeIdentify}
                </button>
                <button 
                    onClick={() => setAnalysisMode('diagnose')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                        analysisMode === 'diagnose' 
                            ? 'bg-rose-500 text-white shadow-md' 
                            : 'text-gray-500 hover:text-rose-500'
                    }`}
                >
                    {text.modeDiagnose}
                </button>
            </div>

            {!selectedImage ? (
              <div 
                className={`relative w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all shadow-sm
                  ${isDragging ? 'border-green-600 bg-green-100 scale-[1.01]' : 'border-green-300 bg-white hover:bg-green-50'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                  {isDragging ? (
                      <>
                        <span className="material-symbols-rounded text-5xl mb-2 text-green-700 scale-110">download</span>
                        <span className="font-medium text-center px-4 text-green-800">{text.dropHere}</span>
                      </>
                  ) : (
                      <div className="flex flex-col items-center gap-4 w-full px-6">
                           <button 
                                onClick={startCamera}
                                className={`w-full text-white py-3 rounded-full flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                                    analysisMode === 'diagnose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-green-600 hover:bg-green-700'
                                }`}
                           >
                                <span className="material-symbols-rounded">photo_camera</span>
                                {text.useCamera}
                           </button>
                           
                           <div className="flex items-center gap-3 w-full">
                               <div className="h-px bg-green-200 flex-1"></div>
                               <span className="text-xs text-green-400 font-medium">OR</span>
                               <div className="h-px bg-green-200 flex-1"></div>
                           </div>

                           <button 
                                onClick={triggerFileInput}
                                className={`font-semibold flex items-center gap-1 py-1 ${
                                   analysisMode === 'diagnose' ? 'text-rose-500 hover:text-rose-700' : 'text-green-600 hover:text-green-800'
                                }`}
                           >
                                <span className="material-symbols-rounded">image</span>
                                {text.uploadFile}
                           </button>
                           
                           <span className="text-xs text-gray-400 hidden sm:block">
                               {text.dragDropHint}
                           </span>
                      </div>
                  )}
              </div>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md group bg-gray-100">
                <img
                  src={selectedImage}
                  alt="Selected plant"
                  className="w-full h-full object-cover"
                  onClick={() => setShowZoom(true)}
                />
                
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent pt-3 pb-6">
                  <button
                    onClick={() => setShowZoom(true)}
                    className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                    aria-label="Zoom image"
                  >
                    <span className="material-symbols-rounded text-xl block">zoom_in</span>
                  </button>

                  <button
                    onClick={clearImage}
                    className="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 backdrop-blur-sm transition-all"
                    aria-label="Remove image"
                  >
                    <span className="material-symbols-rounded text-xl block">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Voice Input Section */}
            <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-center">
                  <h3 className="font-medium text-green-800 text-sm flex items-center gap-2">
                      <span className="material-symbols-rounded text-green-600 text-lg">mic</span>
                      {text.addVoiceNote}
                  </h3>
                  <button 
                      onClick={startListening}
                      className="bg-green-100 hover:bg-green-200 text-green-700 rounded-full p-2 transition-colors"
                      aria-label="Start recording"
                  >
                      <span className="material-symbols-rounded block">mic</span>
                  </button>
              </div>
              
              {voiceText && (
                  <div className="bg-green-50 p-3 rounded-lg text-sm text-green-900 border border-green-200 relative mt-2">
                      <p className="pr-6 italic">"{voiceText}"</p>
                      <button 
                          onClick={clearVoiceText}
                          className="absolute top-1 right-1 text-green-400 hover:text-green-700 p-1"
                      >
                          <span className="material-symbols-rounded text-sm">close</span>
                      </button>
                  </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
        </div>

        {/* Action Button for Image/Voice Analysis */}
        {(selectedImage || voiceText) && !isAnalyzing && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 mb-8 ${
                analysisMode === 'diagnose' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-green-600 hover:bg-green-700'
            } hover:shadow-xl`}
          >
              <span className="material-symbols-rounded">{analysisMode === 'diagnose' ? 'medical_services' : 'search'}</span>
              {analysisMode === 'diagnose' ? text.diagnose : text.identify}
          </button>
        )}

        {/* Loading State Overlay */}
        {isAnalyzing && (
           <div className="fixed inset-0 z-[300] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
             <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center border border-green-100">
                <span className={`material-symbols-rounded animate-spin text-4xl mb-4 ${
                    analysisMode === 'diagnose' ? 'text-rose-500' : 'text-green-600'
                }`}>
                    {analysisMode === 'diagnose' ? 'medical_services' : 'eco'}
                </span>
                <p className={`font-bold text-lg ${
                     analysisMode === 'diagnose' ? 'text-rose-800' : 'text-green-800'
                }`}>{text.analyzing}</p>
             </div>
           </div>
        )}

        {/* Common Guides / Search Section */}
        <div className="animate-fade-in">
            {/* Search Bar */}
            <div className="mb-4 relative group">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">search</span>
                <input 
                    type="text" 
                    placeholder={text.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleWebSearch();
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-800 placeholder-gray-400"
                />
            </div>

            {/* Filter Chips */}
            <div className="mb-6 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                <div className="flex gap-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                                activeFilter === filter.id
                                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                                    : 'bg-white text-gray-600 border-green-100 hover:border-green-300'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-green-600">library_books</span>
                {text.commonGuides}
            </h3>
            
            {/* Dynamic Web Search Button when querying */}
            {searchQuery && (
              <button
                onClick={handleWebSearch}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-md mb-4 flex items-center justify-between group active:scale-95 transition-all"
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-rounded">public</span>
                     {text.searchWeb} "{searchQuery}"
                  </span>
                  <span className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                      {activeFilter !== 'all' ? (
                          <>
                            <span className="material-symbols-rounded text-xs">filter_list</span>
                            Filter: {filters.find(f => f.id === activeFilter)?.label}
                          </>
                      ) : 'Generate comprehensive guide with AI'}
                  </span>
                </div>
                <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
                {filteredPlants.map((plant, index) => (
                    <button
                        key={plant.name}
                        onClick={() => handleGuideSelect(index)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 hover:shadow-md hover:border-green-200 transition-all text-left flex flex-col gap-2 active:scale-95"
                    >
                        <span className="text-3xl mb-1">{plant.icon}</span>
                        <div>
                            <h4 className="font-bold text-green-900">{plant.name}</h4>
                            <span className="text-xs text-green-600 font-medium">{plant.subtitle}</span>
                        </div>
                    </button>
                ))}
                {filteredPlants.length === 0 && !searchQuery && (
                    <div className="col-span-2 text-center py-8 text-gray-500 bg-white rounded-2xl border border-green-50 border-dashed">
                         {text.noResults}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Result Modal - Full Screen Overlay with higher Z-index and safe area padding */}
      {result && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-slide-up">
           {/* Header */}
           <div className="p-4 border-b border-green-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-10 pt-safe-top">
              <h3 className="font-bold text-green-900 truncate pr-4 flex items-center gap-2 text-lg">
                 <span className="material-symbols-rounded text-green-600">eco</span>
                 {(selectedImage || voiceText) ? text.resultTitle : text.guideTitle}
              </h3>
              
              <div className="flex items-center gap-3">
                {onToggleLanguage && (
                  <button 
                    onClick={onToggleLanguage}
                    className="bg-gray-100 hover:bg-green-100 border border-transparent hover:border-green-200 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-green-800 flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-rounded text-sm">language</span>
                    {lang === 'en' ? 'EN' : 'TR'}
                  </button>
                )}
                <button 
                  onClick={() => setResult(null)}
                  className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm border border-red-200 transition-all transform hover:scale-105 active:scale-95"
                  aria-label="Close"
                >
                  <span className="material-symbols-rounded text-xl block">close</span>
                </button>
              </div>
           </div>

           {/* Content - safe area bottom included */}
           <div className="flex-1 overflow-y-auto p-6 pb-32 scroll-smooth">
              {/* Result Image (Hero) */}
              {selectedImage && (
                 <div className="mb-6 rounded-2xl overflow-hidden shadow-md bg-gray-100 border border-green-50 relative group aspect-video">
                    <img 
                        src={selectedImage} 
                        alt="Analyzed Plant" 
                        className="w-full h-full object-cover" 
                        onClick={() => setShowZoom(true)}
                    />
                    <button 
                        onClick={() => setShowZoom(true)} 
                        className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                    >
                       <span className="material-symbols-rounded">zoom_in</span>
                    </button>
                 </div>
              )}

              <MarkdownText content={result} />

              {/* Save & Notes Section */}
              <div className="mt-8 pt-6 border-t border-green-100 pb-safe-bottom">
                  <button 
                      onClick={initiateSaveFlow}
                      disabled={isSavedToGarden || saveStatus === 'saving'}
                      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-6
                        ${isSavedToGarden 
                            ? 'bg-green-100 text-green-700 cursor-default' 
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md active:scale-95'
                        }`}
                  >
                      <span className="material-symbols-rounded">{isSavedToGarden ? 'check_circle' : 'bookmark_add'}</span>
                      {isSavedToGarden ? text.addedToGarden : text.addToGarden}
                  </button>

                   {/* Personal Notes (Pre-save editing) */}
                   {isSavedToGarden && (
                       <div className="animate-fade-in mb-6">
                           <h4 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                                <span className="material-symbols-rounded text-green-600">edit_note</span>
                                {text.personalNotes}
                           </h4>
                           <textarea
                             className="w-full p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-900 placeholder-green-400/70 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none min-h-[100px]"
                             placeholder={text.placeholderNotes}
                             value={noteText}
                             onChange={(e) => setNoteText(e.target.value)}
                           />
                           <p className="text-xs text-gray-400 mt-1 italic">
                               {lang === 'tr' ? 'Notlarınız Bahçem sekmesinde kaydedildi.' : 'Notes are saved in the My Garden tab.'}
                           </p>
                       </div>
                   )}
              </div>
              
               {/* Feedback Section */}
               <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl mb-8">
                  <span className={`text-sm font-medium transition-all duration-300 ${feedbackMessage ? 'text-green-600' : 'text-gray-600'}`}>
                      {feedbackMessage || text.feedbackQuestion}
                  </span>
                  <div className="flex gap-2">
                      <button 
                          onClick={() => handleFeedback('liked')}
                          className={`p-2 rounded-full transition-all ${
                              feedbackStatus === 'liked' 
                                  ? 'bg-green-200 text-green-700' 
                                  : feedbackStatus === 'disliked'
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'bg-white text-gray-400 hover:text-green-600 shadow-sm'
                          }`}
                          disabled={feedbackStatus !== 'none'}
                      >
                          <span className={`material-symbols-rounded ${feedbackStatus === 'liked' ? 'fill-current' : ''}`}>thumb_up</span>
                      </button>
                      <button 
                          onClick={() => handleFeedback('disliked')}
                          className={`p-2 rounded-full transition-all ${
                              feedbackStatus === 'disliked' 
                                  ? 'bg-red-200 text-red-700' 
                                  : feedbackStatus === 'liked'
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'bg-white text-gray-400 hover:text-red-600 shadow-sm'
                          }`}
                          disabled={feedbackStatus !== 'none'}
                      >
                          <span className={`material-symbols-rounded ${feedbackStatus === 'disliked' ? 'fill-current' : ''}`}>thumb_down</span>
                      </button>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* Schedule Confirmation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto text-blue-600">
                 <span className="material-symbols-rounded text-2xl">water_drop</span>
              </div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{text.scheduleTitle}</h3>
              
              {!isManualSchedule && suggestedDays ? (
                <>
                  <p className="text-gray-600 text-center mb-6 text-sm">
                    {text.schedulePrompt(suggestedDays)}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => confirmSchedule(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md"
                    >
                      {text.useRec}
                    </button>
                    <button 
                      onClick={() => confirmSchedule(false)}
                      className="w-full bg-white text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 border border-gray-200"
                    >
                      {text.setManual}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2 text-center">{text.manualLabel}</label>
                     <div className="flex items-center justify-center gap-4">
                        <button 
                            onClick={() => setManualDays(Math.max(1, manualDays - 1))}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95"
                        >
                            <span className="material-symbols-rounded">remove</span>
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-blue-600">{manualDays}</span>
                            <span className="text-xs text-gray-400">{text.daysLabel}</span>
                        </div>
                        <button 
                            onClick={() => setManualDays(manualDays + 1)}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95"
                        >
                            <span className="material-symbols-rounded">add</span>
                        </button>
                     </div>
                  </div>
                  <button 
                    onClick={saveManual}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all shadow-md"
                  >
                    {text.confirmSave}
                  </button>
                </>
              )}
           </div>
        </div>
      )}

      {/* In-App Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[500] bg-black flex flex-col animate-fade-in">
           <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
               <div className="absolute top-safe-top right-4 z-10 pt-4">
                   <button 
                      onClick={stopCamera} 
                      className="bg-black/40 text-white p-3 rounded-full backdrop-blur-md hover:bg-black/60 transition-colors"
                   >
                       <span className="material-symbols-rounded text-2xl">close</span>
                   </button>
               </div>
           </div>
           <div className="h-32 bg-black flex items-center justify-center pb-safe-bottom">
               <button 
                  onClick={takePhoto} 
                  className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                  aria-label={text.snapPhoto}
               >
                   <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10"></div>
               </button>
           </div>
        </div>
      )}
    </div>
  );
};