const chat = require('../services/chat');
const textToSpeech = require('@google-cloud/text-to-speech');
const config = require('../config/config-voice.json'); // Đọc file cấu hình mới

// Tạo client
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: 'config/service-account-key.json'
});

const chatController = {
    async handleChatRequest(req, res) {
        try {
            const { prompt } = req.body;
            const response = await chat.getChatResponse(prompt);

            // Chuyển đổi phản hồi từ ChatGPT thành giọng nói
            const audioContent = await textToSpeechConversion(response);

            // Trả về phản hồi và dữ liệu âm thanh dưới dạng base64
            res.json({ response, audioContent });
        } catch (error) {
            res.status(500).json({ error: 'Something went wrong', detail: error.toString() });
        }
    }
};

async function textToSpeechConversion(text) {
    const request = {
        input: { text: text },
        voice: { languageCode: config.languageCode, ssmlGender: config.ssmlGender },
        audioConfig: { audioEncoding: config.audioEncoding },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');
    return audioContent;
}

module.exports = chatController;
