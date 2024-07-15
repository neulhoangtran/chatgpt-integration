const OpenAI = require("openai");
const config = require('../config/config');

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const chat = {
    async getChatResponse(prompt) {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
        });

        return completion.choices[0].message.content.trim();
    }
};

module.exports = chat;
