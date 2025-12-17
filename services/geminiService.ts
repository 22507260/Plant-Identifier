import { GoogleGenAI, GenerateContentResponse, Chat, FunctionDeclaration, Type } from "@google/genai";
import { Language, Reminder } from "../types";

const apiKey = process.env.API_KEY;

// Use gemini-3-pro-preview as requested for complex reasoning and image understanding
const MODEL_NAME = 'gemini-3-pro-preview';
// Use gemini-2.5-flash for fast web searches and grounding
const SEARCH_MODEL_NAME = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    if (!apiKey) {
      console.error("API_KEY is missing");
      // Allow app to run without API key for UI testing/development if needed,
      // but warn heavily. The calls will fail later if actually used.
      // However, if we throw here, the app crashes on load if `getAI` is called during init?
      // `startChat` calls `getAI` immediately? No, `startChat` calls `getAI`.
      // `analyzePlantImage` calls `getAI`.
      // The issue is if the component calls these on render.
    }
    ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
  }
  return ai;
};

const getSystemInstruction = (lang: Language) => {
  if (lang === 'tr') {
    return `
Sen GreenThumb'sın, uzman bir botanikçi ve bahçecilik asistanısın.
Amacın kullanıcıların bitkileri tanımasına, bakım gereksinimlerini anlamasına ve bahçecilik sorunlarını çözmesine yardımcı olmaktır.
Arkadaş canlısı, cesaret verici ve öz ol.
Metni biçimlendirirken temiz Markdown kullan. Tablo kullanma.
Eğer bitki dışı konular sorulursa, nazikçe konuyu bahçeciliğe geri getir.
Cevaplarını her zaman Türkçe ver, ancak bitki isimlerinde İngilizce karşılıklarını da parantez içinde belirt.
`;
  }
  return `
You are GreenThumb, an expert botanist and gardening assistant.
Your goal is to help users identify plants, understand their care requirements, and solve gardening problems.
Be friendly, encouraging, and concise.
When formatting text, use Markdown. Do not use tables.
If asked about non-plant topics, politely steer the conversation back to gardening.
`;
};

const reminderTool: FunctionDeclaration = {
  name: "scheduleReminder",
  description: "Schedule a gardening reminder for the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      plantName: { type: Type.STRING, description: "The name of the plant." },
      action: { type: Type.STRING, description: "The action to perform (e.g., water, fertilize, prune)." },
      dueInHours: { type: Type.NUMBER, description: "How many hours from now the reminder should be set." },
    },
    required: ["plantName", "action", "dueInHours"],
  },
};

export const startChat = (lang: Language): Chat => {
  const client = getAI();
  return client.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: getSystemInstruction(lang),
      tools: [{ functionDeclarations: [reminderTool] }],
    },
  });
};

const handleScheduleReminder = async (args: any): Promise<any> => {
  const { plantName, action, dueInHours } = args;
  
  // Request notification permission if possible
  if ('Notification' in window && Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }

  const reminder: Reminder = {
    id: Date.now().toString(),
    plantName,
    action,
    dueInHours,
    createdAt: Date.now(),
    dueDate: Date.now() + (dueInHours * 60 * 60 * 1000)
  };

  // Save to localStorage
  const existingRemindersStr = localStorage.getItem('green_thumb_reminders');
  const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
  existingReminders.push(reminder);
  localStorage.setItem('green_thumb_reminders', JSON.stringify(existingReminders));

  window.dispatchEvent(new Event('reminderAdded'));
  
  return { result: "success", message: `Reminder set: ${action} ${plantName} in ${dueInHours} hours.` };
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    let response: GenerateContentResponse = await chat.sendMessage({ message });
    
    while (response.functionCalls && response.functionCalls.length > 0) {
      const functionCalls = response.functionCalls;
      const functionResponses = [];

      for (const call of functionCalls) {
        if (call.name === 'scheduleReminder') {
          console.log("Executing function:", call.name, call.args);
          const result = await handleScheduleReminder(call.args);
          functionResponses.push({
            name: call.name,
            response: { result: result }
          });
        }
      }

      if (functionResponses.length > 0) {
          response = await chat.sendMessage(functionResponses);
      } else {
        break; 
      }
    }

    return response.text || "I processed that, but have no words to say.";
  } catch (error) {
    console.error("Error sending message:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const analyzePlantImage = async (
  base64Image: string | null, 
  lang: Language,
  userPrompt?: string,
  mode: 'identify' | 'diagnose' = 'identify'
): Promise<string> => {
  const client = getAI();
  
  let basePrompt = '';
  
  if (mode === 'diagnose') {
    // DIAGNOSIS MODE PROMPTS
    if (lang === 'tr') {
      basePrompt = `
        ${userPrompt ? `Kullanıcı Açıklaması: "${userPrompt}"\n` : ''}
        Bu görüntüdeki bitkiyi hastalık, zararlı veya besin eksikliği açısından analiz et.
        
        Yanıtı kesinlikle aşağıdaki Markdown formatında düzenle. Tablo kullanma.
        
        # [Hastalık/Sorun Adı]
        **Etkilenen Bitki:** [Bitki Adı]
        
        ### 🔍 Belirtiler
        [Görsel belirtilerin analizi]

        ### 🦠 Nedenler
        [Olası nedenler: mantar, böcek, sulama hatası vb.]

        ### 💊 Tedavi
        1. [Adım 1]
        2. [Adım 2]
        3. [Adım 3]

        ### 🛡️ Önleme
        [Gelecekte nasıl önlenir]
        
        Eğer bitki sağlıklı görünüyorsa, bunu açıkça belirt. Görüntüde bitki yoksa nazikçe uyar.
      `;
    } else {
      basePrompt = `
        ${userPrompt ? `User Description: "${userPrompt}"\n` : ''}
        Analyze the plant in this image for diseases, pests, or nutrient deficiencies.
        
        Structure the response strictly in the following Markdown format. Do not use tables.
        
        # [Disease/Issue Name]
        **Affected Plant:** [Plant Name]
        
        ### 🔍 Symptoms
        [Analysis of visual symptoms]

        ### 🦠 Causes
        [Potential causes: fungal, pest, watering issue, etc.]

        ### 💊 Treatment
        1. [Step 1]
        2. [Step 2]
        3. [Step 3]

        ### 🛡️ Prevention
        [How to prevent in future]
        
        If the plant looks healthy, state that clearly. If there is no plant, please say so politely.
      `;
    }
  } else {
    // IDENTIFY MODE PROMPTS (Existing Logic)
    if (lang === 'tr') {
      basePrompt = `
        ${userPrompt ? `Kullanıcı Açıklaması: "${userPrompt}"\nBu açıklamayı ve (varsa) görüntüyü kullanarak bitkiyi tanımla.` : 'Bu bitkiyi tanımla.'}
        
        Yanıtı kesinlikle aşağıdaki Markdown formatında düzenle. Tablo kullanma. Başlıkların kısa olduğundan emin ol.
        
        # [Türkçe Bitki Adı] ([English Common Name])
        **Bilimsel Ad:** [Scientific Name]
        
        [Kısa bir açıklama]

        ### 💧 Su İhtiyacı
        [Sıklık ve miktar detayları]

        ### ☀️ Güneş Işığı İhtiyacı
        [Işık gereksinimi detayları]

        ### 🖐️ En Önemli 5 Bakım İpucu
        1. [İpucu 1]
        2. [İpucu 2]
        3. [İpucu 3]
        4. [İpucu 4]
        5. [İpucu 5]

        ### 🌱 Nasıl Yetiştirilir
        **Çoğaltma:** [Çoğaltma yöntemleri]
        **Toprak:** [İdeal toprak tipi]
        **Koşullar:** [Sıcaklık ve nem tercihleri]

        ### 💚 Yararlar
        [Faydalar]

        ### ⚠️ Zararlar
        [Toksisite bilgisi]
        
        Eğer girdi bir bitki değilse, nazikçe belirt.`;
    } else {
      basePrompt = `
        ${userPrompt ? `User Description: "${userPrompt}"\nIdentify the plant based on this description and the image (if provided).` : 'Identify this plant.'}
        
        Structure the response strictly in the following Markdown format. Do not use tables. Keep headers concise.

        # [Plant Name]
        **Scientific Name:** [Scientific Name]

        [Brief description]

        ### 💧 Water Needs
        [Details on frequency and amount]

        ### ☀️ Sunlight Needs
        [Details on light requirements]

        ### 🖐️ Top 5 Care Tips
        1. [Tip 1]
        2. [Tip 2]
        3. [Tip 3]
        4. [Tip 4]
        5. [Tip 5]

        ### 🌱 How to Grow
        **Propagation:** [Methods]
        **Soil:** [Soil type]
        **Conditions:** [Ideal temp/humidity]

        ### 💚 Benefits
        [Benefits]

        ### ⚠️ Harms & Toxicity
        [Toxicity info]
        
        If the input (image or text) is not a plant, please say so politely.`;
    }
  }

  const parts: any[] = [{ text: basePrompt }];

  if (base64Image) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    });
  }

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: getSystemInstruction(lang),
      },
    });

    return response.text || "Could not analyze the input.";
  } catch (error) {
    console.error("Error analyzing input:", error);
    throw new Error("Failed to analyze input.");
  }
};

export const searchPlantGuide = async (query: string, lang: Language, plantType?: string): Promise<string> => {
  const client = getAI();
  
  let prompt = '';
  
  const typeContext = plantType && plantType !== 'all' 
    ? (lang === 'tr' ? ` (${plantType} bitkisi olarak)` : ` (as a ${plantType} plant)`) 
    : '';
  
  if (lang === 'tr') {
    prompt = `
      "${query}"${typeContext} hakkında kapsamlı bir bitki bakım rehberi ara ve oluştur.
      Yanıtı aşağıdaki Markdown formatında düzenle. Tablo kullanma.
      Türkçe bitki adının yanına mutlaka İngilizce adını da ekle (Örn: Paşa Kılıcı (Snake Plant)).

      # [Bitki Adı] ([English Common Name])
      **Bilimsel Ad:** [Scientific Name]
      
      [Kısa bir açıklama]

      ### 💧 Su İhtiyacı
      [Detaylı sulama talimatları]

      ### ☀️ Güneş Işığı İhtiyacı
      [Işık gereksinimleri]

      ### 🖐️ En Önemli 5 Bakım İpucu
      1. [İpucu 1]
      2. [İpucu 2]
      3. [İpucu 3]
      4. [İpucu 4]
      5. [İpucu 5]

      ### 🌱 Nasıl Yetiştirilir
      **Çoğaltma:** [Çoğaltma yöntemleri]
      **Toprak:** [İdeal toprak tipi]
      **Koşullar:** [Sıcaklık ve nem tercihleri]

      ### 💚 Yararlar
      [Faydalar]

      ### ⚠️ Zararlar
      [Toksisite]
      
      Eğer arama sonucu bir bitki ile ilgili değilse, bunu belirt.
    `;
  } else {
    prompt = `
      Search for and generate a comprehensive plant care guide for "${query}"${typeContext}.
      Structure the response in the following Markdown format. Do not use tables.

      # [Plant Name]
      **Scientific Name:** [Scientific Name]

      [Brief description]

      ### 💧 Water Needs
      [Detailed watering instructions]

      ### ☀️ Sunlight Needs
      [Light requirements]

      ### 🖐️ Top 5 Care Tips
      1. [Tip 1]
      2. [Tip 2]
      3. [Tip 3]
      4. [Tip 4]
      5. [Tip 5]

      ### 🌱 How to Grow
      **Propagation:** [Methods]
      **Soil:** [Soil type]
      **Conditions:** [Ideal temp/humidity]

      ### 💚 Benefits
      [Benefits]

      ### ⚠️ Harms & Toxicity
      [Toxicity]
      
      If the search result is not related to a plant, please say so.
    `;
  }

  try {
    const response = await client.models.generateContent({
      model: SEARCH_MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "Could not find information on this plant.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      const links = groundingChunks
        .map((chunk: any) => chunk.web?.uri ? `- [${chunk.web.title || 'Source'}](${chunk.web.uri})` : null)
        .filter(Boolean)
        .join('\n');
      
      if (links) {
        text += `\n\n### 🔗 Sources\n${links}`;
      }
    }

    return text;
  } catch (error) {
    console.error("Error searching for plant guide:", error);
    throw new Error("Failed to search for plant guide.");
  }
};