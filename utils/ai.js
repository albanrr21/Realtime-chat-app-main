// utils/ai.js
// using native fetch (available in Node.js 18+)

async function getAIResponse(userPrompt) {
  try {
    const systemContext = "You are TrimChat Bot, a helpful and funny assistant.";
    const fullPrompt = `${systemContext}\n\nUser: ${userPrompt}\nBot:`;
    
    // Use GET request for simpler, often more reliable access on Pollinations
    // Cache-bust with a random seed
    const seed = Math.floor(Math.random() * 10000);
    const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai&seed=${seed}`;

    const response = await fetch(url);
    
    if (!response.ok) {
       return "My brain is fuzzy right now (Server Error). Try again in a second!";
    }

    const text = await response.text();
    
    // Check if we got an HTML error page (like Cloudflare 502) instead of text
    if (text.trim().startsWith('<') || text.includes('502 Bad Gateway')) {
       return "I'm having trouble connecting to the AI cloud (502). Please specify a new API Key if this persists.";
    }

    return text;

  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble thinking right now. (Network Error)";
  }
}

module.exports = { getAIResponse };
