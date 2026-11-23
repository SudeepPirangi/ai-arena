import fs from "fs/promises"
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "./vectorStore.js";
import CONSTANTS from "../constants.js";

// Deletes all chunks belonging to a specific source file using metadata filtering.
export async function deleteDocumentBySource(sourceFile: string | undefined): Promise<void> {
  if (!sourceFile) {
    throw new Error("Please provide a file name to delete vectors.")
  }

  const vectorStore = await getVectorStore();
  console.log(`Removing existing vectors for: ${sourceFile}`)
  await vectorStore.delete({
    filter: { sourceFile }
  })
}

// Wipes the entire vector table
export async function clearAllDocuments(): Promise<void> {
  const vectorStore = await getVectorStore();
  console.log(`Clearing all vectors from ${CONSTANTS.BNS_RAG_TABLE}`)
  await vectorStore.delete({ filter: {} })
}

// Idempotently ingests a PDF
//   - deletes previous vectors for the same filename,
//   - chunks the PDF,
//   - generates embeddings,
//   - and stores them in pgvector
export async function ingestPdfDocument(
  filePath: string,
  originalFileName?: string, 
  deleteTempFile = false
): Promise<{ fileName: string, chunksCount: number}> {
  const absolutePath = path.resolve(filePath)
  const fileName = originalFileName || path.basename(absolutePath)

  try {
    // 1. Delete stale vectors if this file was previously ingested
    await deleteDocumentBySource(fileName)

    // 2. Load and split PDF
    console.log(`Loading PDF: ${fileName}`);
  
    const loader = new PDFLoader(absolutePath)
    const rawDocs = await loader.load()
  
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150
    })
  
    const chunks = await splitter.splitDocuments(rawDocs)

    // 3. Enrich with metadata
    const enrichedChunks = chunks.map((chunk, idx) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        sourceFile: fileName,
        chunkIndex: idx,
        ingestedAt: new Date().toISOString()
      }
    }))

    // 4. Embed and insert into pgvector
    console.log(`Embedding and storing ${enrichedChunks.length} chunks into pgvector...`)
  
    const vectorStore = await getVectorStore();
    await vectorStore.addDocuments(enrichedChunks)
  
    // Optional: Create an HNSW index for fast approximate nearest-neighbor search in production
    await vectorStore.createHnswIndex({
      dimensions: 1536,
      m: 16,
      efConstruction: 64
    })
  
    console.log(`Successfully ingested ${enrichedChunks.length} chunks.`)
    return { fileName, chunksCount: enrichedChunks.length}
  } finally {
    // 5. Clean up temporary uploaded file from disk so server storage doesn't bloat
    if (deleteTempFile) {
      await fs.unlink(absolutePath).catch(() => {
        console.log("Deleted temporary uploaded file")
      })
    }
  }

}