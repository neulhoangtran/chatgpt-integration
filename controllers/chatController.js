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
    "private_key_id": "ea12ab2fa2868e004cdca315995e68edfec34104",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCw9CUYBw+8PSw3\naYT2AgfOzyWk36jbord94UQ/J+TGNYpwGBCfPiSIcZhjs/aCy0RmWpAiM/4lQeQ7\nHyJeTNHqukO/D+q+UAQoeoGtNs2yfPEOLXGuEfPyCkcawph4rcwD4XLNi69rBeZe\nE2mg2It0BKhSzEZqoN+u5CstPAu0hiM5Z8saT+8Mzn8KefRf+zzORDG775RlNWIC\noTLXp4/qMeMIL0uKfov93zoMmTeImyedCpa1AgI1cAbDcpFsYpJTHYW1Tw243Mow\nxHhXmLy4fCkC9DlgjL+V9Z9KZDnH/GxaOgwdbdc5WgGwQAQK4VA3CsHDWp3o+/7n\nScOUMi71AgMBAAECggEAJBXpwZxhCllsPLGdToDMAFHwgo6k1AN7CWXoobt8NSqC\nfIj/zMWitBt8QOrYfMRAguH5jiwNqiHljePzwYjHbyeEfMBddemB65JOAxmPuZQu\noV5FlkKtfYC4jt27s7J3jhwJ6h5QC9J0b99kFUvLpoFzpQzo2EJN00/O+UbLOUkh\npIXwpLCR71UYada08oXYFP+WJQbB4dEnQrgDGpV15/+n235TyNrAo2XNXQXPL1vH\n45W+BLtw3Iow5K5GMqQTmAZ/0nagrVeKDCgKObwVrVf57I1ne0g/WG6ao5fSdtP2\nH3hUwUaBz8qWoUZHM0WLiG+jAc17bm4zCnCMlnLtmQKBgQDcxHWLzEorQIB3WPm3\nfa9UbVgBU0seVkapLVCrkTfc36ucYoh+ujM4ew2SFYnUrZG8zTOL60kTCX3AA4fu\n6/0sawnCaUhD0FO+bWhoQy5GrFtFfsLNnEkrRbiRoE3rhuz4qlmDKwAX47chixpK\nzEIF+KORYr8MPY37TFoVkBauHQKBgQDNMaiPY4eDQfLZIkmKWL1l9zkLlg5CkZFp\nkW3lbxAEJzZoYD2IsNAApiMLgHz40hUhZ0afPlQTypYDcSJYH/Sl5W6aW+R6yizu\nrDbN13zlA0zIIkqA7KcE9uzTnxLmWblCv2XwgrF/Gj+cnMpYhqUFZFdA0q9I00sV\n8riltSkMuQKBgQDG7A6uhMlf56LZ50Y7W/ibrlrZ9t982miZD8fcj+EyGChdpTsw\nVT7J6bb0pounIy5qXMvRi5QwnyC733Kgiet6FoiYsJz43cJXl+W37LDJ5YvoNqv4\n8JXNc+k27qbHTrA/797wHdLbs8fTZa+vLhVfpAZefgd/VAeXI9kYDNki0QKBgQCd\n114vdsNuL5PMfXiOiHag8gyaogI0KN/vkiQ0QjvSxgsvPSD4ffJzHVmF5n+7s3b3\nrAcCRiLM2qCM40ElAufhmVx8NsXJwq3Ppv+9Vc7IJ8KvjNk81U4hHoTMwOf78/bz\npmGXIiHBgQJ/yYhJksFsJWSNA8Q8Q/TVXFG3fmSmWQKBgQCLi89o8FVeI2R8QX7H\nzrbc+rFB7v5X2/8GHnYzHlF+tN5bE9EOxd1+AxCTClmKRlKoh/MYT/YMz1XV0bjc\nCFkRQ0Mue1mCwHsBWjtsJx6xjZPltMljdkZMTg+fn4+2lOo51kqjakfdqeYbj6zR\nChiFmsLlWWfnfnYpU/rrtqhmXQ==\n-----END PRIVATE KEY-----\n",
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