import { ChatResponseSchema, ProcessFrameResponseSchema } from "./schemas";
import type { ChatQueryInput, ChatResponse, LanguageCode, ProcessFrameResponse } from "./types";

export const healthCheck = async (apiUrl: string): Promise<boolean> => {
  try {
    const res = await fetch(`${apiUrl}/api/health`);
    if (!res.ok) return false;
    await res.json();
    return true;
  } catch {
    return false;
  }
};

export const processFrame = async (
  apiUrl: string,
  imageB64: string,
  language: LanguageCode,
): Promise<ProcessFrameResponse | null> => {
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
    const json = await res.json();
    const parsed = ProcessFrameResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Invalid process-frame response:", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.error("Frame processing error:", err);
    return null;
  }
};

export const chatQuery = async (
  apiUrl: string,
  input: ChatQueryInput,
): Promise<ChatResponse | null> => {
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
    const json = await res.json();
    const parsed = ChatResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Invalid chat response:", parsed.error);
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.error("Chat error:", err);
    return null;
  }
};
