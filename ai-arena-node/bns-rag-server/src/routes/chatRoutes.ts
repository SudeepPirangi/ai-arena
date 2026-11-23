import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { streamRagResponse } from "../services/ragService.js"

const router = Router();

const chatRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(2000),
})

router.post('/chat', async (req: Request, res: Response) => {
  const parsed = chatRequestSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten()})
    return;
  }

  // Configure Server Sent Events (SSE) headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform")
  res.setHeader("Connection", "keep-alive")
  res.flushHeaders()

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    await streamRagResponse(
      parsed.data.question,
      (sources) => sendEvent("sources", { sources }),
      (token) => sendEvent("token", { token })
    )

    sendEvent("done", { status: "complete" })
    res.end();
  } catch (error) {
    console.error("Error during RAG streaming:", error);
    sendEvent("error", {
      message: error instanceof Error ? error.message : "Internal Streaming Error"
    })
    res.end()
  }
})

export default router;