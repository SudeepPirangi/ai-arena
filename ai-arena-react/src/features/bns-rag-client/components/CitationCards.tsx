import React from "react";
import { type SourceCitation } from "../types";
import "../bns-rag.css";

export const CitationCards: React.FC<{ sources?: SourceCitation[] }> = ({
  sources,
}) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="citation-card">
      {sources.map((src, idx) => (
        <details key={idx} className="citation-detail">
          <summary className="citation-summary">
            Source {idx + 1}: {src.sourceFile}{" "}
            {src.pageNumber ? `(p. ${src.pageNumber})` : ""}
          </summary>
          <p className="citation-snipper">{src.snippet}</p>
        </details>
      ))}
    </div>
  );
};
