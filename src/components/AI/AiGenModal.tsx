import { useState } from "react";
import { App } from "antd";
import type { RemotionProjectJson } from "../../types";
import {
  getOllamaModel,
  OLLAMA_GENERATE_URL,
  OLLAMA_PROJECT_SYSTEM_PROMPT,
} from "../../config/ollama";
import "./AiGenModal.css";

function formatApiError(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string") return err;
    if (typeof err === "object" && err !== null && "message" in err) {
      const m = (err as { message: unknown }).message;
      if (typeof m === "string") return m;
    }
  }
  return `HTTP ${status}`;
}

function stripMarkdownJsonFence(text: string): string {
  const t = text.trim();
  const idx = t.indexOf("```");
  if (idx === -1) return t;
  let inner = t.slice(idx + 3);
  inner = inner.replace(/^json\s*\n?/i, "");
  const end = inner.indexOf("```");
  if (end !== -1) inner = inner.slice(0, end);
  return inner.trim();
}

function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseProjectFromModelResponse(raw: string): RemotionProjectJson {
  const cleaned = stripMarkdownJsonFence(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const extracted = extractBalancedJsonObject(cleaned);
    if (!extracted) {
      throw new Error("Không tìm thấy JSON hợp lệ trong phản hồi.");
    }
    parsed = JSON.parse(extracted);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("JSON phải là một object.");
  }
  const o = parsed as Record<string, unknown>;
  if (!o.fps || !o.tracks) {
    throw new Error("Thiếu trường bắt buộc (fps, tracks).");
  }
  return parsed as RemotionProjectJson;
}

export interface AiGenModalProps {
  onClose: () => void;
  onApply: (data: RemotionProjectJson) => void;
  /** JSON đang mở trong editor; model dùng làm cơ sở khi user yêu cầu chỉnh sửa. */
  currentProject: RemotionProjectJson;
}

function buildPromptForModel(
  userInstruction: string,
  currentProject: RemotionProjectJson,
): string {
  return [
    "Instruction:",
    userInstruction,
    "",
    "Current project JSON:",
    JSON.stringify(currentProject, null, 2),
  ].join("\n");
}

export function AiGenModal({
  onClose,
  onApply,
  currentProject,
}: AiGenModalProps) {
  const { message } = App.useApp();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Nhập yêu cầu trước khi gửi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(OLLAMA_GENERATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: getOllamaModel(),
          prompt: buildPromptForModel(trimmed, currentProject),
          system: OLLAMA_PROJECT_SYSTEM_PROMPT,
          stream: false,
        }),
      });

      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(formatApiError(data, res.status));
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("response" in data) ||
        typeof (data as { response: unknown }).response !== "string"
      ) {
        throw new Error("Phản hồi Ollama không có trường response.");
      }

      const project = parseProjectFromModelResponse(
        (data as { response: string }).response,
      );
      onApply(project);
      message.success("Đã áp dụng json từ AI.");
      onClose();
      setPrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ai-gen-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="ai-gen-dialog glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-gen-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ai-gen-dialog-header" id="ai-gen-title">
          Tạo project bằng AI
        </div>
        <div className="ai-gen-dialog-body">
          <label className="ai-gen-label" htmlFor="ai-gen-prompt">
            Yêu cầu
          </label>
          <p className="ai-gen-hint">
            Project JSON hiện tại trong editor được gửi kèm để AI chỉnh sửa hoặc thay thế theo lời bạn.
          </p>
          <textarea
            id="ai-gen-prompt"
            className="ai-gen-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: thêm track nhạc mới; đổi duration clip đầu thành 200 frame; tạo project mới hoàn toàn..."
            disabled={loading}
          />
          {error ? <p className="ai-gen-error">{error}</p> : null}
        </div>
        <div className="ai-gen-dialog-footer">
          <button
            type="button"
            className="ai-gen-btn ai-gen-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="ai-gen-btn ai-gen-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}
