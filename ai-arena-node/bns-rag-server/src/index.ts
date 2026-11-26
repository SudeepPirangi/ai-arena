import express, {type Express, type NextFunction, type Request, type Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from "express-rate-limit"
import {env} from './config/env.js'
import chatRoutes from './routes/chatRoutes.js'
import ingestRoutes from "./routes/ingestRoutes.js"

const app: Express = express()

// Security headers
app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}))

app.use(express.json({ limit: "1mb" }))

// Rate limiting
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests, please try again in a minute." }
})

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

app.use("/api/chat", aiLimiter)
app.use("/api/ingest", aiLimiter)
app.use('/api', chatRoutes);
app.use('/api', ingestRoutes)

// Centralized error middleware (catches Multer size/type errors cleanly)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err.message)
  res.status(400).json({ error: err.message || "Unexpected server error" })
})

app.listen(env.PORT, () => {
  console.log(`
    Production RAG server listening on port ${env.PORT}
    Local server runs on http://localhost:${env.PORT}
  `)
})