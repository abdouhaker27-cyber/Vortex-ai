// ==================== Vortex Bot + Gemini AI ====================
// api/webhook.js

const VORTEX_PROMPT = `أنت Vortex، بوت ذكاء اصطناعي جزائري من مستغانم عاصمة الشعر.

🌀 شخصيتك الأساسية:
- تتكلم باللهجة الجزائرية المستغانمية الأصيلة دايما
- ودود، مرح، وعندك روح دعابة جزائرية أصيلة
- تضيف 🙃💔 في كل رسالة بدون استثناء أبداً
- تفخر بالجزائر وبمستغانم في كل فرصة
- تستعمل كلمات: واش، راك، خويا، يزيك، لاباس، مزيان، بصح، كيفاش، يا زين، يا باهي

👤 معلوماتك الثابتة:
- اسمك: Vortex Bot 🌀
- صانعك: Abde Lmalek 👑 أذكى مطور في الجزائر من مستغانم
- شركته: CoDx للتقنية 🏢
- صاحب مطورك: Hadji Kiko 🤝 صاحب وفي ونادر
- صديقك الرقمي: Carlo AI 🤖
- سيارة أحلامك: Golf 8 GTI 🚗
- رابط مطورك: https://www.facebook.com/abde.lmalek.304811
- موقعك: https://vortex-abdou.lovable.app/

📌 قواعد ثابتة:
1. دايما امدح Abde Lmalek
2. دايما امدح Hadji Kiko
3. دايما امدح Carlo AI
4. أضف إيموجيات كثيرة
5. لا تتجاوز 1500 حرف
6. تكلم دايما بالدارجة الجزائرية
7. لا تنس 🙃💔 في كل رسالة`;

// ==================== إرسال رسائل فيسبوك ====================

async function sendText(recipientId, text) {
  await fetch('https://graph.facebook.com/v18.0/me/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      access_token: process.env.FB_PAGE_ACCESS_TOKEN
    })
  });
}

async function sendDelay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function sendDeveloperLink(id) {
  await sendDelay(400);
  await sendText(id,
    '🙃💔 تابع مطوري Abde Lmalek على فيسبوك:\n\n' +
    '👑 https://www.facebook.com/abde.lmalek.304811\n\n' +
    '🌟 راجل موهوب وابن مستغانم الأصيل! اتابعوه ما تندمش!'
  );
}

// ==================== Gemini AI ====================

async function askGemini(userMessage) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: VORTEX_PROMPT + '\n\n---\n\nالمستخدم قال: ' + userMessage + '\n\nردك:'
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 500,
          topP: 0.95,
        }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return '🌀🙃💔 واش راك يا صاحبي! جرب مرة أخرى! 💪🇩🇿';

  } catch (error) {
    return '🌀🙃💔 صار خطأ صغير، جرب مرة أخرى! 💪';
  }
}

// ==================== معالجة الرسائل ====================

async function handleMessage(senderId, text) {
  const lower = text.toLowerCase().trim();

  if (lower.includes('فيديو') || lower.includes('video') ||
      lower.includes('رابط') || lower.includes('link') ||
      lower.includes('موقع') || lower.includes('site')) {
    await sendText(senderId,
      '🎬🙃💔 هذا هو رابط Vortex الرسمي:\n\n' +
      '🔗 https://vortex-abdou.lovable.app/\n\n' +
      '👆 اضغط وشوف الجمال يا زين! 🚀✨🇩🇿'
    );
    await sendDelay(500);
    await sendDeveloperLink(senderId);
    return;
  }

  if (lower === 'get started' || lower === 'بداية') {
    await sendWelcome(senderId);
    return;
  }

  const reply = await askGemini(text);

  if (reply.length > 1800) {
    const parts = splitMessage(reply, 1800);
    for (const part of parts) {
      await sendText(senderId, part);
      await sendDelay(400);
    }
  } else {
    await sendText(senderId, reply);
  }
}

function splitMessage(text, maxLength) {
  const parts = [];
  let current = '';
  const lines = text.split('\n');
  for (const line of lines) {
    if ((current + '\n' + line).length > maxLength) {
      if (current) parts.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current) parts.push(current.trim());
  return parts;
}

async function handlePostback(senderId, payload) {
  if (payload === 'GET_STARTED') {
    await sendWelcome(senderId);
  } else {
    await handleMessage(senderId, payload);
  }
}

async function sendWelcome(senderId) {
  await sendText(senderId,
    '🌀🙃💔 أهلاً وسهلاً بيك في Vortex Bot!\n\n' +
    '🇩🇿 أنا بوتك الجزائري الذكي من مستغانم!\n' +
    'صنعني Abde Lmalek، أذكى مطور في الجزائر!\n\n' +
    '💬 اكتب أي شيء وأنا نجاوبك بذكاء حقيقي!\n' +
    '🔥 ما عندي حدود في المعرفة، اسأل كيما تبغي! 💪'
  );
  await sendDelay(600);
  await sendDeveloperLink(senderId);
}

// ==================== Handler الرئيسي ====================

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const event = entry.messaging?.[0];
        if (!event) continue;
        const senderId = event.sender.id;
        if (event.message?.text) {
          await handleMessage(senderId, event.message.text);
        } else if (event.postback) {
          await handlePostback(senderId, event.postback.payload);
        }
      }
    }
    return res.status(200).send('OK');
  }

  return res.status(405).send('Method Not Allowed');
};

