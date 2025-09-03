import fetch from "node-fetch";

async function getAvailableModels(apiKey: string): Promise<string[]> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    }
  );

  const data:any = await response.json();
  if (data.error) {
    console.error("Error fetching models:", data.error);
    return [];
  }

  return data.models?.map((m: any) => m.name) || [];
}

export async function callGemini(apiKey: string, prompt: string): Promise<string> {
  // Step 1: Fetch available models
  const models = await getAvailableModels(apiKey);

  // Step 2: Choose best model (try pro first, fallback to flash)
  let chosenModel = models.find((m) => m.includes("gemini-pro"));
  if (!chosenModel) {
    chosenModel = models.find((m) => m.includes("gemini-1.5-flash")) 
                || models.find((m) => m.includes("gemini-2.0-flash"));
  }

  if (!chosenModel) {
    throw new Error("No supported Gemini model available for this API key.");
  }

  console.log("Using model:", chosenModel);

  // Step 3: Call generateContent with chosen model
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${chosenModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data:any = await response.json();
  console.log("Gemini response:", data);

  if (data.error) {
    throw new Error(data.error.message || "Gemini API Error");
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated";
}
