import type { ChatResponse, ProcessFrameResponse, SceneContext } from "./types";

export async function healthCheck(apiUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/api/health`);
    if (!res.ok) return false;
    await res.json();
    return true;
  } catch {
    return false;
  }
}

export async function processFrame(
  apiUrl: string,
  imageB64: string,
  language: string,
): Promise<ProcessFrameResponse | null> {
  try {
    const formData = new FormData();
    formData.append("image_b64", imageB64);
    formData.append("language", language);
    formData.append("mode", "navigation");

    const res = await fetch(`${apiUrl}/api/process-frame`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;
    return (await res.json()) as ProcessFrameResponse;
  } catch (err) {
    console.error("Frame processing error:", err);
    return null;
  }
}

export interface ChatQueryInput {
  language: string;
  sceneContext: SceneContext;
  audioBlob?: Blob;
  textQuestion?: string;
}

export async function chatQuery(
  apiUrl: string,
  input: ChatQueryInput,
): Promise<ChatResponse | null> {
  try {
    const formData = new FormData();
    if (input.audioBlob) {
      formData.append("audio_file", input.audioBlob, "question.webm");
    }
    if (input.textQuestion) {
      formData.append("text_question", input.textQuestion);
    }
    formData.append("language", input.language);
    formData.append("scene_context", JSON.stringify(input.sceneContext));

    const res = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      body: formData,
    });
    return (await res.json()) as ChatResponse;
  } catch (err) {
    console.error("Chat error:", err);
    return null;
  }
}
