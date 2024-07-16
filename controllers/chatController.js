import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { franc } from 'franc';
import { getChatResponse } from '../services/chat.js';
import audioConfig from '../config/config-audio.js';

// Tạo client
// const client = new TextToSpeechClient({
//     keyFilename: './config/service-account-key.json' // Đường dẫn tới file khóa dịch vụ
// });

const key = {
    "type": "service_account",
    "project_id": "chat-app-429602",
    "private_key_id": "6a7eb7c37387d3b9ceb397020aec4d94b4dc1e35",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCREoMYqMG5X8UB\nRtReL+oG6S0csBBinWyR2X8TejQv6/2/LmXKthw7vJnTKqHLW14SaRY70EbhZzoZ\nUDQz4ZxmJQd8o1xF9fIEqThm+szmZR9a0mx4wBikdSCq89dgSZjKRft9AS4gPleq\nvF2oj1AwPxHZV0qL7tawIWpX9oRufgxezIN1mrtAscg1ie3eNsH7aQ0jAirswBjp\nGE6M0uEFCQLAa2/8Ad+QI+3H1MzrmT8qtnvvYQrNbkY6gPPpZ7A8dJ3tUyn0gmcw\nIJSsHGWa2BuKcp/ystfI97NI6y9BOY8QCdYe4MnFZo9vKzTk0f06hx5uj0uPzsrc\nP0y20aAvAgMBAAECggEAFx8piyyac76H2lmST3tjhBEgrN8tkrTJ27/GjobTpS+q\nabuDYyOorFIK/P+2edWTe2u0V3mCp+TupZ+Fh8oARhIbd19cvZR4K7YCKfz0hg69\nSJnGdW291Q21/zPjXT1dqh+CoxHPwDkvenmQk+UDlYJNM07DsDneOIRFkW+A+/sY\nN2eSk5cPGApcdB4klA6b44gSF9X2wQ2N5wp6mZys/ovrRO+F/a0fT3K2RZ7atk1Y\nDXMNnKi3ZRnE9W4xWfWb3KfExpsY9Stj8QKtzwnPya+ItHZySY2E33U847FpYsUg\nx7mf0gwlxhoEOk5ioMN4GlmY/rM+w89urPf0dvAXwQKBgQDKViEceMlZcohgsKEf\n5jw1LI9RRTlpez1zY+Oar7E3JSHncNwz6/LyCAOvCZJgx00EHqzEBYHHPMqSOYar\nNM/3NauBtU1vsyiExopkvWT5AxeB0pU01oVrxSlLPOWZ9f3MvjWrCDlAWWkHdQYL\nC5lCcCUhe3S9sVLHrtvtrpYMowKBgQC3jF4JlNyOuiCJWHgMVHHkRHW7WIWJ6i7R\n+wicwheAjlDfr15Xg/05j0P8RJJHi/OEcFlQAR1ReVgZ2Sn1X2TMYbzagqmFT21E\nmahBJPitqsmgWhmC5lQmvv/4dhI0Ab6D2ddhxFbTi8IyMHUak3fG71UpYm6ZVF2g\nUPm4d2wrBQKBgGtXZhmEus0JRfCFw/T4X9iV2zJyVxLunpso0watTobC3Em8RhYF\nhs2AEvQ5T76n/OPCokUb5s2cIpuQiTEqw2mSv3oAhSRNF6HY8nKfR4ITcdUdsqpl\nZELYRh/0HpqfNhX4kuA5bKYGyQF7w8j4TkZA2HH63OQFvrTQvzxI8rGhAoGAbab9\nxtuXp+yp42Nm1HbeU3BSpUmM/YdZ0TgXPQ7222YqCnfJ9J51eR2Nj/enK/b/0+8K\nbDE+Qp4rc8W4u03x+eep2yCUBYAd1w205rYfmiCds54f/4N6YmtYoCZpWYhxOHO7\nqDyTYm3r5e/tBaNzuvTf+4lCaXdtN4kopnsxs8ECgYBRIFeNc9ElAzKcjYCm7+VM\nsFUAC1YFjZ+0M+qbIV3yLBygkk16K5dQDxAEj3PBbA+R75FfZTvcclZmlA0MQLFV\ncqDTT7MP0iDAK7LAyEzdByX+PXhQrkWg6pmfT/IDC799tsMiW66TSKflX/+/94CG\nlohH4M0X/TP4QylGBdnwtw==\n-----END PRIVATE KEY-----\n",
    "client_email": "neul-chat-app@chat-app-429602.iam.gserviceaccount.com",
    "client_id": "112424880918566843848",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/neul-chat-app%40chat-app-429602.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}


// const key = JSON.parse(process.env.GOOGLE_CLOUD_KEY);
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