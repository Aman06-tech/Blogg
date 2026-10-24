import { errorHandler } from "../utils/error.js";

// gemini-2.5-flash was retired for new API keys — Google returns 404 with a
// pointer to a current model. Override with GEMINI_MODEL if this one is retired
// in turn; `curl .../v1beta/models` lists what a key can reach.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const callGemini = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured in .env");
  }

  // The key goes in a header, not the query string, so it stays out of access
  // logs and proxy traces.
  const response = await fetch(
    `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Gemini API Error (${GEMINI_MODEL}, ${response.status}):`, errorData);
    let detail = "";
    try {
      detail = JSON.parse(errorData)?.error?.message || "";
    } catch {
      detail = "";
    }
    throw new Error(detail || `Gemini API request failed (${response.status})`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;

  if (!text) {
    // A response with no text means the model stopped early — most often
    // MAX_TOKENS or a safety block. Say which, rather than returning "".
    const reason = candidate?.finishReason || data.promptFeedback?.blockReason;
    console.error("Gemini returned no text. finishReason:", reason, JSON.stringify(data).slice(0, 500));
    throw new Error(
      reason
        ? `The AI returned no text (${reason}). Try shorter content.`
        : "The AI returned an empty response. Please try again."
    );
  }

  return text;
};

export const enhanceContent = async (req, res, next) => {
  try {
    const { content, enhanceType } = req.body;

    if (!content) {
      return next(errorHandler(400, "Content is required"));
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (enhanceType) {
      case "improve":
        systemPrompt = "You are an expert content editor. Improve the given text by making it more engaging, clear, and professional while maintaining the original meaning and tone. Return ONLY the single improved version of the text — no preamble, no commentary, no alternative options, no markdown code fences.";
        userPrompt = `Please improve the following content:\n\n${content}`;
        break;
      case "grammar":
        systemPrompt = "You are an expert proofreader. Fix any grammar, spelling, and punctuation errors in the given text. Return the corrected text only.";
        userPrompt = `Please fix the grammar and spelling in the following content:\n\n${content}`;
        break;
      case "expand":
        systemPrompt = "You are a creative content writer. Expand the given text by adding more details, examples, and depth while maintaining the original style and message. Return ONLY the expanded text — no preamble, no commentary, no alternative options.";
        userPrompt = `Please expand the following content with more details:\n\n${content}`;
        break;
      case "summarize":
        systemPrompt = "You are an expert summarizer. Create a concise summary of the given text while preserving the key points and main ideas. Return ONLY the summary — no preamble or commentary.";
        userPrompt = `Please summarize the following content:\n\n${content}`;
        break;
      case "title":
        systemPrompt = "You are a creative headline writer. Generate 5 compelling, SEO-friendly titles for the given content. Return ONLY the titles, numbered 1-5, with no preamble or commentary.";
        userPrompt = `Generate 5 title suggestions for the following content:\n\n${content}`;
        break;
      case "outline":
        systemPrompt = "You are a content strategist. Create a detailed outline for expanding the given topic into a full blog post. Include main sections and sub-points. Return ONLY the outline itself — no preamble, no closing commentary.";
        userPrompt = `Create a blog post outline for the following topic:\n\n${content}`;
        break;
      default:
        systemPrompt = "You are a helpful writing assistant.";
        userPrompt = content;
    }

    const enhancedContent = await callGemini(systemPrompt, userPrompt);

    res.status(200).json({
      success: true,
      enhancedContent,
      enhanceType,
    });
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    next(errorHandler(500, error.message || "Failed to enhance content"));
  }
};

export const generateTitleSuggestions = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return next(errorHandler(400, "Content is required"));
    }

    const titlesText = await callGemini(
      "You are a creative headline writer. Generate exactly 5 compelling, SEO-friendly blog post titles. Return ONLY the titles, one per line, numbered 1-5. Make them catchy and engaging.",
      `Generate 5 title suggestions for a blog post about:\n\n${content}`
    );

    const titles = titlesText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      titles,
    });
  } catch (error) {
    console.error("Title Generation Error:", error);
    next(errorHandler(500, error.message || "Failed to generate titles"));
  }
};
