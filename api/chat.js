import { handleChatRequest } from '../controllers/chatController.js';

export default function handler(req, res) {
    if (req.method === 'POST') {
        handleChatRequest(req, res);
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
