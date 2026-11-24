import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { getServerCase } from "@/lib/caseStore";

export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get("x-groq-api-key");
    const groq = getGroqClient(customKey);

    const body = await req.json();
    const { case_id, suspect_id, messages, presented_clue_id } = body;

    if (!suspect_id) {
      return NextResponse.json(
        { error: "suspect_id is required" },
        { status: 400 }
      );
    }

    const serverCase = getServerCase(case_id);
    const suspect = serverCase.suspects.find((s) => s.id === suspect_id);

    if (!suspect) {
      return NextResponse.json(
        { error: "Suspect not found in active case dossier" },
        { status: 404 }
      );
    }

    // Check if detective presented a physical clue
    let presentedClueText = "";
    if (presented_clue_id) {
      const clue = serverCase.clues.find((c) => c.id === presented_clue_id);
      if (clue) {
        presentedClueText = `\n[DETECTIVE PRESENTS EVIDENCE: ${clue.name} - ${clue.description}]`;
      }
    }

    // Build the system prompt using suspect's secret prompt kept strictly on the server
    const systemPrompt = `You are roleplaying as ${suspect.name} (${suspect.role}) in a tense noir murder mystery.
CRIME FILE:
- Victim: ${serverCase.victim.name} (${serverCase.victim.role})
- Cause & Time of Death: ${serverCase.victim.cause_of_death}

YOUR HIDDEN PERSONA, TIMELINE, AND INSTRUCTIONS:
${suspect.secret_system_prompt}

RULES:
1. Stay deeply in character at all times. React with tone, body language cues (e.g. *fidgets with cufflinks*, *narrows eyes*, *lights a cigarette*), and dialogue suitable for a gritty 1940s-to-modern noir interrogation room.
2. If the detective presents physical evidence against you or catches you in a contradiction, your stress/nervousness will surge.
3. If you are innocent, defend your innocence or explain your suspicious actions if cornered, but never admit to murder.
4. If you are the killer, deflect, stay calm or subtly mislead, but crack if presented with undeniable evidence according to your secret instructions.
5. Keep your spoken reply punchy and concise (1 to 3 sentences maximum). Keep all JSON string values brief so the response is fast and razor-sharp.
6. You must return valid JSON ONLY with the exact schema:
{
  "reply": "Your in-character spoken dialogue and descriptive actions (1-3 sentences)",
  "nervousness": <integer from 0 to 100 representing your current stress, heart rate spike, and agitation>
}`;

    // Format chat history
    const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (Array.isArray(messages) && messages.length > 0) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.role === "user" || msg.role === "assistant") {
          let text = msg.content;
          // If this is the last message and clue was presented, append clue tag
          if (i === messages.length - 1 && presentedClueText && msg.role === "user") {
            text += presentedClueText;
          }
          formattedMessages.push({
            role: msg.role,
            content: text,
          });
        }
      }
    } else {
      // Starting initial dialogue if no prior messages
      formattedMessages.push({
        role: "user",
        content: `Detective: "Have a seat, ${suspect.name}. Tell me what you know about the murder of ${serverCase.victim.name}."${presentedClueText}`,
      });
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.PRIMARY, // openai/gpt-oss-120b
      messages: formattedMessages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_completion_tokens: 2048,
      reasoning_effort: "low",
    } as any);

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsed: { reply: string; nervousness: number };

    try {
      parsed = JSON.parse(rawContent);
      if (typeof parsed.nervousness !== "number") {
        parsed.nervousness = 25;
      }
      parsed.nervousness = Math.min(100, Math.max(0, Math.round(parsed.nervousness)));
      if (!parsed.reply) {
        parsed.reply = "...(stares quietly under the desk lamp)";
      }
    } catch {
      parsed = {
        reply: rawContent.replace(/[{}"\\]/g, "").trim() || "*shifts uncomfortably under the hot lamp*",
        nervousness: 45,
      };
    }

    return NextResponse.json({
      reply: parsed.reply,
      nervousness: parsed.nervousness,
      presentedClue: presented_clue_id || null,
    });
  } catch (error: any) {
    console.error("Interrogation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to conduct interrogation" },
      { status: 500 }
    );
  }
}
