import path from 'path';
import fs from 'fs';
import express from 'express';

const app = express();

// Bundle.js is servered from static
app.use('/static', express.static(path.resolve(__dirname, '../dist')));

app.get('*', (req, res) => {
    const html = fs
        .readFileSync(path.resolve(__dirname, './index.html'))
        .toString();

    res.send(html);
});

app.listen(3000, () => {
    console.log('Listening on: http://localhost:3000');
});
