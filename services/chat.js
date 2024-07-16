import OpenAI from "openai";
import config from '../config/config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const getChatResponse = async (prompt) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ],
    });

    console.log(completion);
    return completion.choices[0].message.content.trim();
};

export { getChatResponse };
