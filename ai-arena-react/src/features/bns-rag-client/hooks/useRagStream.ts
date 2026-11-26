import { useState, useRef, useCallback } from "react";
import { type SourceCitation, type ChatMessage } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function useRagStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const uploadPdf = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadStatus(`Ingesting ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/ingest`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload PDF");
      }

      setUploadStatus(
        `Ready: ${data.fileName} (${data.chunksCount} chunks indexed)`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed");
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      const userMsgId = crypto.randomUUID();
      const assistantMsgId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: question },
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          isStreaming: true,
        },
      ]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let currentEvent = "message";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // keep incomplete trailing line in buffer for next packet
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("event:")) {
              currentEvent = trimmed.slice(6).trim();
            } else if (trimmed.startsWith("data:")) {
              const payload = JSON.parse(trimmed.slice(5).trim());

              if (currentEvent === "sources") {
                const sources: SourceCitation[] = payload.sources;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, sources } : m,
                  ),
                );
              } else if (currentEvent === "token") {
                const token: string = payload.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + token }
                      : m,
                  ),
                );
              } else if (currentEvent === "error") {
                throw new Error(payload.message || "Stream error");
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(
            err instanceof Error ? err.message : "Failed to stream response",
          );
        }
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
          ),
        );
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming],
  );

  return {
    messages,
    isStreaming,
    isUploading,
    uploadStatus,
    error,
    sendMessage,
    stopStream,
    uploadPdf,
  };
}
