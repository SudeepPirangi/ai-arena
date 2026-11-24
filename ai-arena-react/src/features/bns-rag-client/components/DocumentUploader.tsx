import React, { useRef } from "react";
import "../bns-rag.css";

interface Props {
  isUploading: boolean;
  uploadStatus: string | null;
  onUpload: (file: File) => void;
}

export const DocumentUploader: React.FC<Props> = ({
  isUploading,
  uploadStatus,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = ""; // Allow re-selecting the same file to re-ingest
    }
  };

  return (
    <div className="document-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="upload-button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
      >
        {isUploading ? "Indexing PDF..." : "Upload / Re-ingest PDF"}
      </button>
      {uploadStatus && <span className="upload-status">{uploadStatus}</span>}
    </div>
  );
};
