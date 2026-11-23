import { PGVectorStore } from "@langchain/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { type PoolConfig } from "pg";
import { env } from "../config/env.js";
import CONSTANTS from "../constants.js";

const embeddings = new OpenAIEmbeddings({
  model: env.EMBEDDING_MODEL,
  apiKey: env.OPENAI_API_KEY
})

const pgConfig = {
  postgresConnectionOptions: {
    connectionString: env.DATABASE_URL
  } as PoolConfig,
  tableName: CONSTANTS.BNS_RAG_TABLE,
  columns: {
    idColumnName: "id",
    vectorColumnName: "embedding",
    contentColumnName: "content",
    metadataColumneName: "metadata",
  },
  distanceStrategy: "cosine" as const
}

let vectorStoreInstance: PGVectorStore | null = null;

export async function getVectorStore(): Promise<PGVectorStore> {
  if (!vectorStoreInstance) {
    vectorStoreInstance = await PGVectorStore.initialize(embeddings, pgConfig)
  }
  return vectorStoreInstance
}