import { ingestPdfDocument } from "./services/ingestionService.js";

async function run() {
  const targetFile = process.argv[2] || "./data/BNS 2023.pdf";
  try {
    const count = await ingestPdfDocument(targetFile)
    console.log(`Done! Total chunks stored: ${count}`)
    process.exit(0)
  } catch (error) {
    console.error("Ingestion failed", error)
    process.exit(1)
  }
}

run()