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
    "private_key_id": "5f50788efc9066f39d87877cd7847aacd1e84633",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDhDBZ7Ft0SXde8\nCUb/baTkH07CnXFilkw3aFyAJ64cQRNMxtrFIAhjlmScLXsolTirpCZn2P81zr1v\nrfWZGQYiPt8D18I/FeL+D+atW1Wp5A3gWEEKJJE0eVjGrRmnMl6cDnro495SnBwP\nuCbP59ZzMz2PkF7/LehaCwGbBXJab7WHZq6X1oWG2RuIsWoSc0+0R5ylqeMnlSea\n2FwSfsxoBJS9Cnn3IJxayT9ZQJAvzDdBuHS/tD2u9stwTJrPp6lWwvX/u5BpovGq\nEnj6mMhHccEGTFL6OAOweozaTUN3BGi5thEXAv7SGI1HO3T8zkwvSoLPmhaBcFAW\nAeoBJakhAgMBAAECggEABjlLNAXMdxDMt/hBto5ko6OuUwM6cOop85jKz/OXwATn\nK+SOcdumAjTo32cB/C0vYH/UmBQtoNhnA0EODtah3i3RtqZDNvz25CAoc/FcsyFY\njdIZKmClIYywWJvOKL1tkLV1MahEQBHaGSDizjV1fjdYt2wq3j/Id0Ab52l7TdLF\n8kfSxMfV4of5jRvNN+iWfBobYcpj5wfpHbXsZhKXsMTlhtFMYmlGz+9TM5DpY9tD\na5gk0i/CRVVdarPzyNQTKWoPmYqmia+x8ApGFf/VEGRv767tYIjQAqJLEw+DPMXM\nJA/LYxMduXX1tiYaSAHY6HbwzYfXRJFTJj4TFu4tyQKBgQDxWMhqJ29wiOUi8N6i\n2IknhH/N9ipKypnnBHjt4NXDVxfB7Eb4wd9TjI5xBLldVMnAXvmh2OGpUmC7JEUQ\nFfDLhUm03LOC9+PQVnQycS8Y8qbdWNbKKOal7xvcmMs0CONQpTM5rutcAPBFUXko\n1hXlPqMkC8VPshPdoabkKygENwKBgQDutfZ+oiTdKNiO2rv1h7afj2rKElCSUS/R\nYj9+Z7FkNF7dHMRbMzHxsXCfYFrdb3aEbsTvu+k5AcjvoJq8kn1vi8Pn0WDqpo+S\ntQwJhio2uGLM2BoCqwZSNUGL4mZ29GHv/JLpmibzjI6jH5JjMO/boQj5yOPlgAdI\nuqGLM9ZBZwKBgBNlcj3ty2v85IVpXEs0Idm2MVtJJF78Z2AEoP9lKWjYkAU6yv1k\n/2DElBILMiaJEOnP+DoEpyYng7SmlpJTYRXKMYFCl364E2wD9rSzGfjkT3rMj/6R\nSPAfBls1QGd/K12o2TQSlcHAJY88nAMnKX1SCmR0ObhM9IHEYxhFS6MDAoGBAK4+\niKU6+imtTRZJt/WrkLS73TmPUNzdAkiWrL46NpRsXeqMuw/PON+xpAHSNcF5QUu+\nB2bvBXilQuUXmJuZWpJ3tRKcFWBzIE34dcbl9h5nTUc1Xxcfe8e6NBRFuIGQNYUW\nGq8F5PTWXq/XteVNrWfmDkU2TJQTdj2ybYTM29J1AoGBAKsKoCNeAOXpvw0kpOQG\nIduWAX7ewYV/siTZyljBx2W3C294JXjnLs0hAm9Ir3B1FXtKCOmvnwiBypZq+gJ8\nhmYuFRdBByVfTnvT8MQg9X+aJFefZI6mXnX0FqdwufLgB+DjmBGs8MwewI9oKPdo\nIJoAHmfANYA+PgIoqOPSMupc\n-----END PRIVATE KEY-----\n",
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
        const { prompt, character } = req.body;
        const response = await getChatResponse(prompt);

        // Phát hiện ngôn ngữ từ phản hồi
        const detectedLang = detectLanguage(response);

        // Chuyển đổi phản hồi từ ChatGPT thành giọng nói
        const audioContent = await textToSpeechConversion(response, detectedLang, character);

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

const textToSpeechConversion = async (text, lang, character = 'shen') => {
    const request = {
        input: { text: text },
        voice: { languageCode: audioConfig[character][lang].languageCode, name: audioConfig[character][lang].name },
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