import { GoogleGenAI } from '@google/genai';
import { db } from './db';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateMessengerReply(
  userMessage: string,
  customerName: string = 'ລູກຄ້າ'
): Promise<{ replyText: string; replyType: 'ai' | 'rule' }> {
  const config = db.getMessengerConfig();
  const lowerMsg = userMessage.trim().toLowerCase();

  // 1. Check auto-reply rules first
  for (const rule of config.autoReplyRules) {
    if (!rule.isActive) continue;
    const kw = rule.keyword.toLowerCase().trim();
    if (rule.matchType === 'exact' && lowerMsg === kw) {
      return { replyText: rule.replyText, replyType: 'rule' };
    }
    if (rule.matchType === 'contains' && lowerMsg.includes(kw)) {
      return { replyText: rule.replyText, replyType: 'rule' };
    }
  }

  // 2. If AI auto reply is enabled, use Gemini
  if (config.aiAutoReplyEnabled) {
    const ai = getAI();
    const products = db.getProducts().filter(p => p.isActive);
    const settings = db.getSettings();

    const productCatalog = products
      .map(
        p =>
          `- ${p.name} (ລະຫັດ: ${p.sku}): ລາຄາ ${p.price.toLocaleString('lo-LA')} ກີບ, ຈຳນວນໃນສາງ: ${p.stock > 0 ? `${p.stock} ຊິ້ນ` : 'ໝົດຊົ່ວຄາວ'}, ໝວດໝູ່: ${p.category}. ${p.description}`
      )
      .join('\n');

    const systemPrompt = `${config.aiPromptInstruction}

ຂໍ້ມູນຮ້ານຄ້າປັດຈຸບັນ:
- ຊື່ຮ້ານ: ${settings.shopName}
- ເບີໂທ: ${settings.shopPhone}
- ທີ່ຢູ່ຮ້ານ: ${settings.shopAddress}
- ບັນຊີ BCEL One: ${settings.bcelAccountNumber} (ຊື່: ${settings.bcelAccountName})
- ຄ່າຈັດສົ່ງ ນະຄອນຫຼວງວຽງຈັນ: ${settings.shippingFeeVientiane.toLocaleString('lo-LA')} ກີບ
- ຄ່າຈັດສົ່ງ ຕ່າງແຂວງ: ${settings.shippingFeeProvinces.toLocaleString('lo-LA')} ກີບ

ລາຍການສິນຄ້າໃນຮ້ານ:
${productCatalog}

ກະລຸນາຕອບຂໍ້ຄວາມຂອງລູກຄ້າເປັນພາສາລາວ ຢ່າງສຸພາບ, ຊັດເຈນ, ແລະ ສົ່ງເສີມການຂາຍ. ຖ້າສິນຄ້າໝົດ ໃຫ້ແຈ້ງຂໍອະໄພ.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });
        const text = response.text?.trim();
        if (text) {
          return { replyText: text, replyType: 'ai' };
        }
      } catch (err) {
        console.error('Error generating AI reply with Gemini:', err);
      }
    }

    // Contextual fallback when Gemini API key is not configured or in offline simulation
    return {
      replyText: getFallbackLaoReply(userMessage, products, settings, customerName),
      replyType: 'ai',
    };
  }

  return {
    replyText: 'ສະບາຍດີເຈົ້າ ຂໍຂອບໃຈທີ່ຕິດຕໍ່ມາ ແອັດມິນກຳລັງກວດສອບ ແລະ ຈະຕອບກັບໂດຍໄວທີ່ສຸດເດີເຈົ້າ!',
    replyType: 'rule',
  };
}

function getFallbackLaoReply(
  msg: string,
  products: any[],
  settings: any,
  customerName: string
): string {
  const m = msg.toLowerCase();
  if (m.includes('ລາຄາ') || m.includes('ເທົ່າໃດ') || m.includes('ເທົ່າໃດກີບ')) {
    const matched = products.find(p => m.includes(p.name.toLowerCase()) || m.includes(p.sku.toLowerCase()));
    if (matched) {
      return `ສະບາຍດີເຈົ້າ ${customerName}! ສິນຄ້າ ${matched.name} ລາຄາ ${matched.price.toLocaleString('lo-LA')} ກີບ/ຊິ້ນເຈົ້າ (ຍັງເຫຼືອໃນສາງ ${matched.stock} ຊິ້ນ). ສົນໃຈຮັບຈັກຊິ້ນດີເຈົ້າ?`;
    }
    return `ສະບາຍດີເຈົ້າ ${customerName}! ສິນຄ້າໃນຮ້ານເຮົາມີລາຄາເລີ່ມຕົ້ນພຽງ 75,000 - 280,000 ກີບເຈົ້າ ລູກຄ້າສົນໃຈສິນຄ້າລາຍການໃດສາມາດແຈ້ງຊື່ ຫຼື ສົ່ງຮູບມາສອບຖາມໄດ້ເລີຍເດີເຈົ້າ!`;
  }

  if (m.includes('ສົ່ງ') || m.includes('ຮອດຕອນໃດ') || m.includes('ຈັດສົ່ງ')) {
    return `ສະບາຍດີເຈົ້າ! ຮ້ານເຮົາຈັດສົ່ງທົ່ວປະເທດລາວ:\n- ໃນນະຄອນຫຼວງວຽງຈັນ: ຄ່າສົ່ງ ${settings.shippingFeeVientiane.toLocaleString('lo-LA')} ກີບ (ສົ່ງເຖິງທີ່)\n- ຕ່າງແຂວງ: ຄ່າສົ່ງ ${settings.shippingFeeProvinces.toLocaleString('lo-LA')} ກີບ (ສົ່ງຜ່ານ ຮຸ່ງອາລຸນ / ອານຸສິດ 1-2 ມື້ຮອດເຈົ້າ)`;
  }

  if (m.includes('ໂອນ') || m.includes('ຈ່າຍ') || m.includes('ເງິນ')) {
    return `ສາມາດຊຳລະຜ່ານ BCEL One ໄດ້ງ່າຍໆເຈົ້າ:\nເລກບັນຊີ: ${settings.bcelAccountNumber}\nຊື່ບັນຊີ: ${settings.bcelAccountName}\nໂອນແລ້ວສົ່ງສະລິບຢັ້ງຢືນ ພ້ອມແຈ້ງເບີໂທ ແລະ ບ່ອນຈັດສົ່ງໄດ້ເລີຍເດີເຈົ້າ!`;
  }

  return `ສະບາຍດີເຈົ້າ ${customerName}! ຍິນດີຕ້ອນຮັບສູ່ ${settings.shopName}. ສິນຄ້າພ້ອມສົ່ງທຸກລາຍການ ສາມາດແຈ້ງລາຍການທີ່ສົນໃຈເພື່ອໃຫ້ແອັດມິນສະຫຼຸບຍອດໄດ້ເລີຍເດີເຈົ້າ!`;
}
