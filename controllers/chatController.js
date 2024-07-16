import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { franc } from 'franc';
import { getChatResponse } from '../services/chat.js';
import audioConfig from '../config/config-audio.js';

// Tạo client
// const client = new TextToSpeechClient({
//     keyFilename: './config/service-account-key.json' // Đường dẫn tới file khóa dịch vụ
// });

const key = JSON.parse(process.env.GOOGLE_CLOUD_KEY);
const client = new TextToSpeechClient({ credentials: key });

const handleChatRequest = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await getChatResponse(prompt);

        // Phát hiện ngôn ngữ từ phản hồi
        const detectedLang = detectLanguage(response);

        // Chuyển đổi phản hồi từ ChatGPT thành giọng nói
        const audioContent = await textToSpeechConversion(response, detectedLang);

        // const a = await listVoices();
        // Trả về phản hồi và dữ liệu âm thanh dưới dạng base64
        res.json({ response, audioContent });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong', detail: error });
    }
};

// Chuyển đổi detectLanguage thành arrow function
const detectLanguage = (text) => {
    const langCode = franc(text);
    if (langCode === 'eng') return 'en';
    if (langCode === 'vie') return 'vi';
    return 'en'; // Mặc định là tiếng Anh nếu không phát hiện được
}

const textToSpeechConversion = async (text, lang) => {
    const request = {
        input: { text: text },
        voice: { languageCode: audioConfig[lang].languageCode, name: audioConfig[lang].name },
        audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');
    return audioContent;
}

export { handleChatRequest };



async function listVoices() {
    const [result] = await client.listVoices({});
    const voices = result.voices;
    console.log('Available vi-VN voices:');
    voices.forEach(voice => {
        if (voice.languageCodes.includes('vi-VN')) {
            console.log(`Name: ${voice.name}, Language Codes: ${voice.languageCodes.join(', ')}`);
        }
    });
}