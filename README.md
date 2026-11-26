# ai-arena
Hosting a range of AI applications at one place

## Running BNS RAG application locally

- Initially, you need to start the backend server
  1. You need to have your Docker launched.
  2. Navigate to ai-arena/ai-arena-node/bns-rag-server.
  3. Run the command `docker-compose up --build -d`.
  4. To verify if the app is running hit `http://localhost:3000/api/health`.

- Run the react application by 
   1. Navigating to ai-arena/ai-arena-react.
   2. Run the command `npm run dev`.
   3. App should be running on `http://localhost:5173`.
   4. Click on `AI BNS Master`.
   5. Initially upload a PDF file.
   6. You can start prompting with the questions you have from document.