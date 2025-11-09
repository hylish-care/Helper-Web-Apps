
import { GoogleGenAI } from "@google/genai";

// It is assumed that process.env.API_KEY is provided in the execution environment.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    // In a real app, you might want to handle this more gracefully,
    // but for this context, throwing an error is sufficient.
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

export const extractTextFromImage = async (
  mimeType: string,
  base64Image: string
): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: "Perform OCR on this image. Extract all visible text from this document. Preserve the original line breaks and formatting as much as possible. Do not add any commentary, explanation, or markdown formatting. Only provide the raw extracted text.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    if (error instanceof Error) {
        return `Error calling Gemini API: ${error.message}`;
    }
    return "An unknown error occurred during text extraction.";
  }
};
