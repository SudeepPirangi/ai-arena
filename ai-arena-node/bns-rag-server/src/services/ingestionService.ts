import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "./vectorStore.js";

export async function ingestPdfDocument(filePath: string): Promise<number> {
  const absolutePath = path.resolve(filePath)
  const filename = path.basename(absolutePath)

  console.log(`Loading PDF: ${filename}`);

  const loader = new PDFLoader(absolutePath)
  const rawDocs = await loader.load()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150
  })

  const chunks = await splitter.splitDocuments(rawDocs)

  // Attach clean metadata for frontend source citations
  const enrichedChunks = chunks.map((chunk, idx) => ({
    ...chunk,
    metadata: {
      ...chunk.metadata,
      sourcefile: filename,
      chunkIndex: idx,
      ingestedAt: new Date().toISOString()
    }
  }))

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
  return enrichedChunks.length
}