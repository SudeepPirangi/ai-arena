import express, {type Express, type Request, type Response} from 'express';
import cors from 'cors';
import {env} from './config/env.js'
import chatRoutes from './routes/chatRoutes.js'

const app: Express = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    chatModel: env.CHAT_MODEL,
    embeddingModel: env.EMBEDDING_MODEL,
  });
})

app.get('/', (req: Request, res: Response) => {
  res.send("Hello World!");
})

app.use('/api', chatRoutes);

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})