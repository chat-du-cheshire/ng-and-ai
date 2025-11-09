import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HashbrownOpenAI } from '@hashbrownai/openai';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env['PORT'] || 3000;

app.post('/chat', async (req, resp) => {
    const stream = HashbrownOpenAI.stream.text({
        apiKey: process.env['OPEN_AI_KEY']!,
        request: req.body,
    });

    resp.header('Content-Type', 'application/octet-stream');

    for await (const chunk of stream) {
        resp.write(chunk);
    }

    resp.end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
