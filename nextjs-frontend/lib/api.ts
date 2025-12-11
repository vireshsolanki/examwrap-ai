// API Client for Rust Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function uploadPDF(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.text;
}

export async function generateExam(content: string, config: any, context: any) {
  const res = await fetch(`${API_URL}/generate-exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, config, context }),
  });

  if (!res.ok) throw new Error("Generation failed");
  return res.json();
}

export async function analyzeResults(questions: any[], answers: any[]) {
  const res = await fetch(`${API_URL}/analyze-result`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions, answers }),
  });

  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}
