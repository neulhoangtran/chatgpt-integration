import express from 'express';
import bodyParser from 'body-parser';
import chatRoutes from './routes/chatRoutes.js';
import config from './config/config.js';

const app = express();

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use('/api', chatRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
