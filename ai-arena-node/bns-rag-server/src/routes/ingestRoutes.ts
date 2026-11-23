import { Router, type Request, type Response } from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import {
  ingestPdfDocument,
  deleteDocumentBySource,
  clearAllDocuments
} from '../services/ingestionService.js'

const router = Router()

// Ensure temporary uploads folder exists
const uploadDir = path.resolve("./uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure Multer with PDF validation and 15MD limit
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed"))
    }
  }
})

// POST /api/ingest - Upload & Ingest (or re-ingest) a PDF
router.post("/ingest", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      error: "No PDF file provided under field name 'file'"
    })
    return;
  }

  try {
    const result = await ingestPdfDocument(
      req.file.path,
      req.file.originalname,
      true
    )

    res.status(200).json({
      message: "Document ingested successfully",
      ...result
    })
  } catch (error) {
    console.error("Ingestion route error:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to ingest PDF"
    })
  }
})

// DELETE /api/ingest/:fileName - Remove a specific document's vectors
router.delete("/ingest/:fileName", async (req: Request, res: Response) => {
  try {
    const fileName = Array.isArray(req.params.fileName) ? req.params.fileName[0] : req.params.fileName
    await deleteDocumentBySource(fileName)
    res.json({ message: `Deleted vectors for ${fileName}` })
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete document vectors"
    })
  }
})

// DELETE /api/ingest - Wipe all vectors
router.delete("/ingest", async (_req: Request, res: Response) => {
  try {
    await clearAllDocuments()
    res.json({ message: "All vectors cleared from database" })
  } catch(error) {
    res.status(500).json({
      error: "Failed to clear vector database"
    })
  }
})

export default router