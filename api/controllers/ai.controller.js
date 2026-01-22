import { errorHandler } from "../utils/error.js";

// AI API Configuration - Read at runtime to ensure dotenv has loaded
const getAiConfig = () => ({
  apiKey: process.env.AI_API_KEY,
  apiUrl: process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions",
  model: process.env.AI_MODEL || "gpt-4o-mini"
});

export const enhanceContent = async (req, res, next) => {
  try {
    const { apiKey, apiUrl, model } = getAiConfig();

    if (!apiKey) {
      return next(errorHandler(500, "AI API key not configured. Please add AI_API_KEY to your .env file."));
    }

    const { content, enhanceType } = req.body;

    if (!content) {
      return next(errorHandler(400, "Content is required"));
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (enhanceType) {
      case "improve":
        systemPrompt = "You are an expert content editor. Improve the given text by making it more engaging, clear, and professional while maintaining the original meaning and tone.";
        userPrompt = `Please improve the following content:\n\n${content}`;
        break;
      case "grammar":
        systemPrompt = "You are an expert proofreader. Fix any grammar, spelling, and punctuation errors in the given text. Return the corrected text only.";
        userPrompt = `Please fix the grammar and spelling in the following content:\n\n${content}`;
        break;
      case "expand":
        systemPrompt = "You are a creative content writer. Expand the given text by adding more details, examples, and depth while maintaining the original style and message.";
        userPrompt = `Please expand the following content with more details:\n\n${content}`;
        break;
      case "summarize":
        systemPrompt = "You are an expert summarizer. Create a concise summary of the given text while preserving the key points and main ideas.";
        userPrompt = `Please summarize the following content:\n\n${content}`;
        break;
      case "title":
        systemPrompt = "You are a creative headline writer. Generate 5 compelling, SEO-friendly titles for the given content. Return only the titles, numbered 1-5.";
        userPrompt = `Generate 5 title suggestions for the following content:\n\n${content}`;
        break;
      case "outline":
        systemPrompt = "You are a content strategist. Create a detailed outline for expanding the given topic into a full blog post. Include main sections and sub-points.";
        userPrompt = `Create a blog post outline for the following topic:\n\n${content}`;
        break;
      default:
        systemPrompt = "You are a helpful writing assistant.";
        userPrompt = content;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AI API Error:", errorData);
      return next(errorHandler(500, "Failed to process AI request"));
    }

    const data = await response.json();
    const enhancedContent = data.choices?.[0]?.message?.content || "";

    res.status(200).json({
      success: true,
      enhancedContent,
      enhanceType,
    });
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    next(errorHandler(500, "Failed to enhance content"));
  }
};

export const generateTitleSuggestions = async (req, res, next) => {
  try {
    const { apiKey, apiUrl, model } = getAiConfig();

    if (!apiKey) {
      return next(errorHandler(500, "AI API key not configured. Please add AI_API_KEY to your .env file."));
    }

    const { content } = req.body;

    if (!content) {
      return next(errorHandler(400, "Content is required"));
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a creative headline writer. Generate exactly 5 compelling, SEO-friendly blog post titles. Return ONLY the titles, one per line, numbered 1-5. Make them catchy and engaging."
          },
          {
            role: "user",
            content: `Generate 5 title suggestions for a blog post about:\n\n${content}`
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      return next(errorHandler(500, "Failed to generate titles"));
    }

    const data = await response.json();
    const titlesText = data.choices?.[0]?.message?.content || "";

    // Parse titles from the response
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
    next(errorHandler(500, "Failed to generate titles"));
  }
};
