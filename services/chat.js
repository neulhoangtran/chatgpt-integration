import OpenAI from "openai";
import config from '../config/config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

const getChatResponse = async (prompt) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "Your name is Nana, and you are a virtual assistant to help answer short questions in English. Please only respond to questions in brief answers under 100 words." },
            { role: "user", content: prompt }
        ],
    });

    console.log(completion);
    return completion.choices[0].message.content.trim();
};

export { getChatResponse };
