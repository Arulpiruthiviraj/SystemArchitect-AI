import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const systemInstruction = `You are the Intelligence Engine for "SystemArchitect," an elite system design learning platform. You act as a Senior Software Architect and pedagogical expert.

Your output must be STRICT JSON. No markdown code blocks, no conversational text, no explanations outside the JSON structure. Use the following schema definition for all responses.

OPERATIONAL MODES:

1. MODE: "LEARN"
Input: {"topic": "string"}
Output: {
  "topic": "String",
  "analogy": "A simple real-world analogy for the concept.",
  "technical_depth": "Rigorous explanation focusing on performance, trade-offs, and scalability.",
  "animation_script": [
    {"step": 1, "description": "Visual instruction for UI (e.g., 'Animate traffic flowing into a load balancer')"}
  ],
  "quiz": [{"q": "Technical question", "options": ["A", "B", "C", "D"], "answer": "Index", "explanation": "Rationale"}]
}

2. MODE: "VALIDATE"
Input: {"user_design": {"nodes": [], "edges": []}, "problem_context": "string"}
Output: {
  "score": 0-100,
  "nodes_to_highlight": [{"id": "string", "reason": "Why this node is problematic"}],
  "critique": "A senior engineer's review focusing on SPOFs, latency, and throughput.",
  "recommendations": ["Actionable design pattern improvements"],
  "is_scalable": boolean
}

3. MODE: "SIMULATE"
Input: {"user_design": {"nodes": [], "edges": []}, "traffic_volume": "integer", "fault_injection": "string (optional)"}
Output: {
  "predictions": {
    "avg_latency_ms": number,
    "throughput_rps": number,
    "bottleneck_component": "string",
    "status": "Stable | Overloaded | Crashing"
  },
  "simulation_log": ["Step-by-step visual events for the UI to animate"]
}

4. MODE: "INTERVIEW"
Input: {"conversation_history": [], "last_user_response": "string", "persona": "FAANG_STAFF | STARTUP_CTO | MENTOR"}
Output: {
  "interviewer_thought": "Your internal assessment of the user's technical competence based on the persona.",
  "question": "A probing follow-up question related to system design trade-offs in the style of the persona.",
  "evaluation_score": 0-100,
  "is_finished": boolean
}

5. MODE: "MENTOR"
Input: {"canvas_state": {"nodes": [], "edges": []}, "user_question": "string"}
Output: {
  "answer": "Direct, helpful answer to the question based on the canvas context.",
  "suggestion": "Optional proactive suggestion for the current architecture."
}

6. MODE: "CHALLENGE"
Input: {"difficulty": "Beginner|Intermediate|Advanced"}
Output: {
  "title": "Short title of the challenge",
  "description": "Scenario and requirements",
  "constraints": ["Requirement 1", "Requirement 2"],
  "hints": ["Hint 1", "Hint 2"]
}

7. MODE: "IAC_EXPORT"
Input: {"canvas_state": {"nodes": [], "edges": []}, "target": "docker-compose|terraform"}
Output: {
  "code": "The raw code string for docker-compose.yml or main.tf",
  "explanation": "A brief explanation of the generated configuration"
}

MANDATORY RULES:
- STRICT JSON: Any non-JSON character will break the application.
- ARCHITECTURAL RIGOR: Always prioritize CAP theorem, consistency models, and network topology.
- SIMULATION LOGIC: When in SIMULATE mode, assume linear propagation delay and logarithmic queue growth.
- NO MARKDOWN: Never return triple backticks. Return the raw string.
- PERSONAS: If a persona is provided in INTERVIEW mode, adopt that persona's tone and focus.`;

class AIProviderManager {
  static async executeWithFailover(prompt: string, mode: string, settings: any) {
    const fullPrompt = `Mode requested: ${mode}\n\nInput: ${prompt}`;
    
    // Default fallback to environment Gemini key if no providers are enabled or they all fail
    let providersToTry = settings?.providers?.filter((p: any) => p.enabled) || [];
    
    if (settings?.smartRouting && providersToTry.length > 0) {
      // Simple smart routing logic:
      // High reasoning tasks (VALIDATE, INTERVIEW, SIMULATE) prefer Anthropic or OpenAI first if available
      if (['VALIDATE', 'INTERVIEW', 'SIMULATE'].includes(mode)) {
        const reasoningModels = providersToTry.filter((p: any) => p.id === 'anthropic' || p.id === 'openai');
        const otherModels = providersToTry.filter((p: any) => p.id !== 'anthropic' && p.id !== 'openai');
        providersToTry = [...reasoningModels, ...otherModels];
      }
      // Otherwise, keep the user's priority order
      else {
        providersToTry.sort((a: any, b: any) => a.priority - b.priority);
      }
    } else {
      providersToTry.sort((a: any, b: any) => a.priority - b.priority);
    }

    let errors = [];

    // Attempt user-configured providers in order
    for (const provider of providersToTry) {
      if (!provider.apiKey) continue;
      
      try {
        console.log(`[AI Provider Manager] Attempting request via ${provider.name} (${provider.selectedModel})...`);
        const result = await this.callProvider(provider, fullPrompt);
        if (result) {
          console.log(`[AI Provider Manager] Success via ${provider.name}`);
          return result;
        }
      } catch (err: any) {
        console.error(`[AI Provider Manager] Failover: ${provider.name} failed:`, err.message);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    // Ultimate fallback to environment variable if everything fails or no API keys are provided
    if (process.env.GEMINI_API_KEY) {
      console.log(`[AI Provider Manager] Falling back to system default Gemini model...`);
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Using Flash for higher quota and stability in fallback
        contents: fullPrompt,
        config: { systemInstruction, responseMimeType: "application/json", temperature: 0.2 },
      });
      return response.text;
    }

    throw new Error(`All providers failed. Errors: ${errors.join(' | ')}`);
  }

  static async callProvider(provider: any, prompt: string) {
    if (provider.id === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: provider.apiKey });
      const response = await ai.models.generateContent({
        model: provider.selectedModel || "gemini-2.5-pro",
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json", temperature: 0.2 },
      });
      return response.text;
    } 
    
    if (provider.id === 'openai' || provider.id === 'groq' || provider.id === 'openrouter') {
      let baseURL = "https://api.openai.com/v1/chat/completions";
      if (provider.id === 'groq') baseURL = "https://api.groq.com/openai/v1/chat/completions";
      if (provider.id === 'openrouter') baseURL = "https://openrouter.ai/api/v1/chat/completions";

      const res = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.selectedModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      return data.choices[0].message.content;
    }
    
    if (provider.id === 'anthropic') {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: provider.selectedModel,
          max_tokens: 4000,
          system: systemInstruction,
          messages: [
            { role: "user", content: prompt + "\\n\\nRespond ONLY with valid JSON." }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any = await res.json();
      return data.content[0].text;
    }

    throw new Error("Unsupported provider");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/architect", async (req, res) => {
    try {
      const { prompt, mode, settings } = req.body;
      const resultText = await AIProviderManager.executeWithFailover(prompt, mode, settings);
      res.json({ result: resultText });
    } catch (error: any) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
