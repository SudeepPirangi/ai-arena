import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRagStream } from "./hooks/useRagStream";
import { DocumentUploader } from "./components/DocumentUploader";
import { CitationCards } from "./components/CitationCards";
import "./bns-rag.css";

export const RagAssistantPage: React.FC = () => {
  const [input, setInput] = useState("");
  const {
    messages,
    isStreaming,
    isUploading,
    uploadStatus,
    error,
    sendMessage,
    stopStream,
    uploadPdf,
  } = useRagStream();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="bns-container">
      <DocumentUploader
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        onUpload={uploadPdf}
      />

      <div className="bns-alert">
        {messages.length === 0 && (
          <p className="bns-info">
            Upload a PDF above and ask any question grounded in your document.
          </p>
        )}

        {messages.map((msg) => (
          <div
            className={`bns-message ${msg.role === "user" ? "bns-user" : "bns-assistant"}`}
            // style={{
            //   alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            //   background: msg.role === "user" ? "#2563eb" : "#f9fafb",
            //   color: msg.role === "user" ? "#fff" : "#111827",
            //   border: msg.role === "assistant" ? "1px solid #e5e7eb" : "none",
            // }}
          >
            {msg.role === "user" ? (
              <div>{msg.content}</div>
            ) : (
              <>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content || (msg.isStreaming ? "Thinking..." : "")}
                </ReactMarkdown>
                <CitationCards sources={msg.sources} />
              </>
            )}
          </div>
        ))}
      </div>

      {error && <div className="bns-error">{error}</div>}

      <form onSubmit={handleSubmit} className="bns-form">
        <input
          type="text"
          className="bns-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your uploaded document..."
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button type="button" onClick={stopStream} className="bns-stop">
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className="bns-send">
            Send
          </button>
        )}
      </form>
    </div>
  );
};
