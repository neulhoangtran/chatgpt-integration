import dotenv from 'dotenv';

dotenv.config();

export default {
    openaiApiKey: process.env.OPENAI_API_KEY,
    port: process.env.PORT || 8200
};
