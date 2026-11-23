import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { saveServerCase, toPublicCaseData } from "@/lib/caseStore";
import { ServerCaseData } from "@/types/serverMystery";

export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get("x-groq-api-key");
    const groq = getGroqClient(customKey);

    const newCaseId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const systemPrompt = `You are a master mystery writer and puzzle architect creating an intricate, solvable 3-suspect murder mystery for a detective noir investigation game.

REQUIREMENTS:
1. Generate an entirely new mystery case with:
   - A dramatic case title (e.g. "The Velvet Room Poisoning", "The Phantom of St. Jude's", "Shadows over Pier 42")
   - A distinct victim with name, wealthy or influential role, and specific cause & time of death.
   - Exactly 3 physical clues found at the crime scene (e.g. shattered objects, encrypted phones, traces, torn letters, strange receipts). Each clue must have an id: "clue_1", "clue_2", "clue_3", name, and detailed description.
   - Exactly 3 distinct suspects with id: "suspect_1", "suspect_2", "suspect_3".
     * EXACTLY ONE of the suspects must be THE KILLER ("is_killer": true).
     * The other two suspects must be INNOCENT ("is_killer": false) but have compelling secrets, lies, or alibi complications to make them plausible red herrings.
     * Each suspect must have a "name", "role", "public_bio", and "secret_system_prompt".
     * The killer's "secret_system_prompt" MUST explicitly specify their guilt, their exact motive, the exact method used, and state that they must act innocent until confronted with key evidence and timeline.
     * The innocent suspects' "secret_system_prompt" MUST state they are innocent, explain what they were doing, what suspicious thing they did (e.g. snooping, stealing a file, eavesdropping), and what clue they might have noticed.
   - A ground-truth "solution" object containing:
     * "killer_id" (e.g. "suspect_1", "suspect_2", or "suspect_3")
     * "killer_name"
     * "motive"
     * "method"
     * "timeline"
     * "full_truth" (a 2-3 sentence canonical summary of the murder)

Return valid JSON ONLY strictly adhering to this structure:
{
  "case_title": string,
  "victim": {
    "name": string,
    "role": string,
    "cause_of_death": string
  },
  "clues": [
    { "id": "clue_1", "name": string, "description": string },
    { "id": "clue_2", "name": string, "description": string },
    { "id": "clue_3", "name": string, "description": string }
  ],
  "suspects": [
    {
      "id": "suspect_1",
      "name": string,
      "role": string,
      "public_bio": string,
      "secret_system_prompt": string,
      "is_killer": boolean
    },
    {
      "id": "suspect_2",
      "name": string,
      "role": string,
      "public_bio": string,
      "secret_system_prompt": string,
      "is_killer": boolean
    },
    {
      "id": "suspect_3",
      "name": string,
      "role": string,
      "public_bio": string,
      "secret_system_prompt": string,
      "is_killer": boolean
    }
  ],
  "solution": {
    "killer_id": string,
    "killer_name": string,
    "motive": string,
    "method": string,
    "timeline": string,
    "full_truth": string
  }
}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.PRIMARY, // openai/gpt-oss-120b
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate a gripping, airtight noir murder mystery case." },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 3000,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const generatedCase = JSON.parse(rawContent) as Omit<ServerCaseData, "case_id">;

    // Validate structure
    if (
      !generatedCase.case_title ||
      !generatedCase.victim ||
      !Array.isArray(generatedCase.clues) ||
      !Array.isArray(generatedCase.suspects) ||
      !generatedCase.solution
    ) {
      throw new Error("Generated case format was incomplete");
    }

    // Ensure killer flag and solution align
    const killerSuspect = generatedCase.suspects.find(
      (s) => s.id === generatedCase.solution.killer_id || s.is_killer
    );
    if (killerSuspect) {
      killerSuspect.is_killer = true;
      generatedCase.solution.killer_id = killerSuspect.id;
      generatedCase.solution.killer_name = killerSuspect.name;
    }

    const fullServerCase: ServerCaseData = {
      case_id: newCaseId,
      case_title: generatedCase.case_title,
      victim: generatedCase.victim,
      clues: generatedCase.clues,
      suspects: generatedCase.suspects,
      solution: generatedCase.solution,
    };

    // Save strictly to server storage
    saveServerCase(fullServerCase);

    // Return sanitized public case data to client
    const publicData = toPublicCaseData(fullServerCase);

    return NextResponse.json({
      success: true,
      case_data: publicData,
    });
  } catch (error: any) {
    console.error("Generate case error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate new case" },
      { status: 500 }
    );
  }
}
