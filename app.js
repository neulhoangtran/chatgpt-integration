const express = require('express');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const config = require('./config/config');

const app = express();

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use('/api', chatRoutes);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
