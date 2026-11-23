import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";

import { env } from "../config/env.js";
import { getVectorStore } from "./vectorStore.js";

export interface SourceCitation {
  sourceFile: string;
  pageNumber?: number;
  snippet: string;
}

const llm = new ChatOpenAI({
  model: env.CHAT_MODEL,
  temperature: 0,
  apiKey: env.OPENAI_API_KEY
})

const ragPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a precise, helpful AI assistant. Answer the user's question strictly using ONLY the provided context below.
    If the context cannot be found in the context, state clearly: "I do not have enough information in the provided documents to answer that."
    Always cite the source file and page number when referencing specific facts.
    
    Context:
    {context}`
  ],
  ["human", "{question}"],
]);

function formatDocsWithCitations(docs: Document[]): string {
  return docs.map((doc, index) => {
    const file = doc.metadata?.sourceFile || "Unknown source";
    const page = doc.metadata?.loc?.pageNumber ?? "N/A";
    const pageContent = doc.pageContent
    return `[Source ${index + 1} | File: ${file} | Page: ${page}\n${pageContent}]`
  }).join("\n\n---\n\n")
}

export async function streamRagResponse(
  question: string,
  onSources: (sources: SourceCitation[]) => void,
  onToken: (token: string) => void
): Promise<void> {
  const vectorStore = await getVectorStore();
  const retriever = vectorStore.asRetriever({ k: 4 })

  // 1. Retrieve relevant chunks from pgvector
  const retrievedDocs = await retriever.invoke(question)

  // 2. Immediately send source citation to the client
  const citations: SourceCitation[] = retrievedDocs.map((doc) => ({
    sourceFile: doc.metadata?.sourceFile || "Unknown source",
    pageNumber: doc.metadata?.loc?.pageNumber,
    snippet: doc.pageContent.slice(0, 180) + '...',
  }))
  onSources(citations)

  // 3. compose LCEL(LangChain Expression Language) chain: Prompt -> LLM -> StringOutputParser
  const chain = ragPrompt.pipe(llm).pipe(new StringOutputParser())

  // 4. Stream tokens as they arrive from OpenAI
  const stream = await chain.stream({
    context: formatDocsWithCitations(retrievedDocs),
    question
  })

  for await (const chunk of stream) {
    if (chunk) {
      onToken(chunk)
    }
  }
}