import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { getServerCase } from "@/lib/caseStore";

export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get("x-groq-api-key");
    const groq = getGroqClient(customKey);

    const body = await req.json();
    const { case_id, accused_suspect_id, theory, motive, method } = body;

    if (!accused_suspect_id) {
      return NextResponse.json(
        { error: "Accused suspect ID is required" },
        { status: 400 }
      );
    }

    const serverCase = getServerCase(case_id);
    const accused = serverCase.suspects.find((s) => s.id === accused_suspect_id);

    if (!accused) {
      return NextResponse.json(
        { error: "Accused suspect not found in active case records" },
        { status: 404 }
      );
    }

    const isKiller = serverCase.solution.killer_id === accused.id || accused.is_killer === true;

    const systemPrompt = `You are Chief Inspector Henderson, a battle-hardened, cigar-chomping noir Chief of Police grading a homicide detective's final case submission.

GROUND TRUTH OF THE CRIME (STRICT CONFIDENTIAL POLICE ARCHIVE):
- True Killer: ${serverCase.solution.killer_name} (ID: ${serverCase.solution.killer_id})
- True Motive: ${serverCase.solution.motive}
- True Murder Weapon & Method: ${serverCase.solution.method}
- Timeline of Murder: ${serverCase.solution.timeline}
- Full Solution Summary: ${serverCase.solution.full_truth}

DETECTIVE'S SUBMISSION FOR FINAL VERDICT:
- Formally Accused Suspect: ${accused.name} (${accused.role})
- Detective's Theory of the Crime: ${theory || "No detailed theory provided."}
- Stated Motive: ${motive || "Unspecified"}
- Stated Method / Weapon: ${method || "Unspecified"}

EVALUATION CRITERIA:
1. Did the detective accuse the TRUE killer?
   - If the detective accused an INNOCENT suspect (${isKiller ? "Detective DID accuse the true killer" : "Detective ACCUSED AN INNOCENT PERSON"}), then "is_correct" MUST be FALSE, and the overall score MUST NOT exceed 45.
   - If the detective accused the true killer, "is_correct" is TRUE, and score should range from 70 to 100 based on how accurately they deduced the motive, method, and timeline.
2. Evaluate their deduction with gritty police chief feedback:
   - If correct: Praise their sharp deductive skills, cite the key clues that sealed the case, and rubber-stamp the conviction for the District Attorney.
   - If incorrect: Berate their sloppy police work, warn that the defense lawyer will rip them to shreds in court, and order the case dismissed.
   - SPOILER GUARDRAIL: If the detective accused the wrong person or their theory failed, DO NOT spoil or mention the name of the true killer, the actual murder weapon, or the secret motive in your feedback! Keep your critique focused strictly on the flaws in their accusation against ${accused.name}.
3. Keep the feedback concise (2 to 3 punchy sentences) and all JSON string values brief.

OUTPUT FORMAT:
Return valid JSON ONLY matching this schema:
{
  "is_correct": boolean,
  "score": number, // integer between 0 and 100
  "feedback": "Your 2-3 sentence gritty chief evaluation addressing the detective directly without spoiling the true killer if incorrect.",
  "breakdown": {
    "culprit_identified": boolean,
    "motive_accuracy": number, // 0 - 100
    "method_accuracy": number, // 0 - 100
    "timeline_accuracy": number // 0 - 100
  }
}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.PRIMARY, // openai/gpt-oss-120b
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Chief, I am submitting my final arrest warrant and case dossier against ${accused.name}. Review my findings and issue your verdict.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 2048,
      reasoning_effort: "low",
    } as any);

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsed: {
      is_correct: boolean;
      score: number;
      feedback: string;
      breakdown?: {
        culprit_identified: boolean;
        motive_accuracy: number;
        method_accuracy: number;
        timeline_accuracy: number;
      };
    };

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        is_correct: isKiller,
        score: isKiller ? 85 : 30,
        feedback: isKiller
          ? `Solid work, Detective. ${accused.name} is in handcuffs and the D.A. has an open-and-shut case.`
          : `You've got the wrong suspect, Detective. Your evidence against ${accused.name} will never stand up before a grand jury. CASE DISMISSED!`,
      };
    }

    // Double check sanity
    if (!isKiller) {
      parsed.is_correct = false;
      parsed.score = Math.min(45, parsed.score);
    } else {
      parsed.is_correct = true;
      parsed.score = Math.max(65, Math.min(100, parsed.score));
    }

    return NextResponse.json({
      ...parsed,
      true_solution: {
        killer_name: serverCase.solution.killer_name,
        motive: serverCase.solution.motive,
        method: serverCase.solution.method,
        full_truth: serverCase.solution.full_truth,
      },
    });
  } catch (error: any) {
    console.error("Verdict error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process verdict" },
      { status: 500 }
    );
  }
}
