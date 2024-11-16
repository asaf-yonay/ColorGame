const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "src" directory
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'scripts')));


// Default route to serve the game HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'game.html'));
});

// Error handling middleware
app.use((req, res) => {
    res.status(404).send('File not found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
