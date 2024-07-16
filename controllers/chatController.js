import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { franc } from 'franc';
import { getChatResponse } from '../services/chat.js';
import audioConfig from '../config/config-audio.js';

// Tạo client
// const client = new TextToSpeechClient({
//     keyFilename: './config/service-account-key.json' // Đường dẫn tới file khóa dịch vụ
// });

const key = {
    type: "service_account",
    project_id: "chat-app-429602",
    private_key_id: "b799bb778bdf1bfeddad0a154d7d439d1376174d",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCixFnPEhcvV3sa\npr4iNCUKxWvMwuSxFQRlwcRBBHwQwgQ27/Q346DiUNf4fNQUjBgTC8zlis/xTRMs\nd1yfyQT4+cQclJwEu2ouZZqlC/nJhYPeY8E6QAPXxISrJW3U1yeDJmJLgcWFph8f\n+whghyHZciuE0jePKJzfvjAYKYcqdXv8yn6jnXyyoP/w1m76fvsZ1nDj8OvNzenS\n0FnquJLf8PpfAD4CeYYCuHJT6flrue8Zf1ksr1XuXSL4agAKNX6pCsfWTz8qqwo0\nrgwmrJ6d8LRzUc49eYhxWe/QKlD5tEn9glsVjcaHwuP5k7hExvVD5uZmvejjY/2T\nfKTKE5QlAgMBAAECggEABesb1OK0gx0sNcDgYwAAZM7e55gilqnL+iM8jpyqIjXb\nz1+UQr/9Jp2H7NolIAYkDfU84w/UFdMWomRIsuqtSpxSXDOvJKDn8H3zTJMN5xz6\nuYhpC0Qun5beuBZpUvbr0eIAavxyATUUJqaLHG9tdKmpGXBHYuY4Jg6VUxuXdZy3\nJnDmNIJznrJ9NT87/0YnREvlp3Igmne/BUPlOJyHdptSsA+j1psFkN4IvQUP5LGz\nf5B51BZAcYAFjh/BeI1eY8XZEQne7yDpIKizKyN5kQ7Nt/BdqBvxbHs1FHPnArFq\neGV0nf9+PDkE7a8FHNIBqakwiEPopRvjjsD9uAmDQQKBgQDSUphGssRsrF7629Qn\n6ILo8pJd/ksH8FRSaiMQBGJJgqJuOnHxvaRTp5GEnJGXHU4NRFqlCBOA01xbNMTN\n6/QwefsFbLgKN1aRO2ByKsWaxmjzcW1mcfHfPuWIgFvkX+f4QhhqVy9ZYJ1+5Epb\n1YNSxOFv3f5niGYlFoYTHAhr8QKBgQDGHchwueHAFRI5iPuyw/ndQCvobSNAueD9\n5MPL1SzrPkh/9lOnO9LsHD4RYFmutqt1aNvu2G8V6TbPe74pmStlevzDEbi6KSr6\nXOg1V3gS7pZjW7FQN6Ulcfvqu3NiHcflrhnMRuXClqDrnUujkaDUfFn84JOTuUF0\nFOoOgfkvdQKBgEN/4IEoFGQwOddWv9MDCyiJ2TGzUA8/MUC18YTNc2HWPB0WQsVr\nsJZsfAZMXWlbLVaSrmiym9fHfaeD2vmflWINc+N8zd/xfKXloYFiesK+lKY0rACp\n5w9X10CkuVkk8oS5aa6PRpHvsPwtdjPc5WWl7BgD7gb6PpX+kY8GeylxAoGANL9v\nQ5wqIAM8M/dl1GXbW+4fAqY0MaKL5e2Ht/iNGiEeGnvSL/98nAK0/9lgZ2UZZ4xA\nqmoTwYizYDC5I8g1RrKlI6bPQTl+yOP9q14biSbfAZtDLXFzVfHwOcIo6WG2fE+L\nbNkfiVyjgbgCkI1QfeKR7wM4J6e2Zpq+6pfuaZUCgYBgC8Ub9A4/wL5BMxA7A+4L\ngttnBjrdN0BGCRQLKzb0x/FJmA5+kaaBzqekIbo+dDGp1wJL8JF653Zs+c5VoFer\nto8hIkjODR1FeQ8sd50pf4JuiNTT06De2QYxNY5tXIcDIQrC1gJ8tKOPXfkqeEPe\nKMz5NpQTWxXDjdssHzX+3w==\n-----END PRIVATE KEY-----\n",
    client_email: "neul-chat-app@chat-app-429602.iam.gserviceaccount.com",
    client_id: "112424880918566843848",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/neul-chat-app%40chat-app-429602.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
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