import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { getServerCase } from "@/lib/caseStore";

export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get("x-groq-api-key");
    const groq = getGroqClient(customKey);

    const body = await req.json();
    const { case_id, clue_id } = body;

    if (!clue_id) {
      return NextResponse.json(
        { error: "clue_id is required" },
        { status: 400 }
      );
    }

    const serverCase = getServerCase(case_id);
    const clue = serverCase.clues.find((c) => c.id === clue_id);

    if (!clue) {
      return NextResponse.json(
        { error: "Clue not found in current case file" },
        { status: 404 }
      );
    }

    const suspectsList = serverCase.suspects
      .map((s) => `${s.name} (${s.role}) - Bio: ${s.public_bio}`)
      .join("\n");

    const systemPrompt = `You are the lead Crime Lab Forensics Specialist examining evidence from a homicide crime scene.
CRIME DETAILS:
Victim: ${serverCase.victim.name} (${serverCase.victim.role})
Cause & Context: ${serverCase.victim.cause_of_death}

EVIDENCE ITEM SUBMITTED FOR SCAN:
Name: ${clue.name}
Crime Scene Notes: ${clue.description}

PERSONS OF INTEREST:
${suspectsList}

Analyze this physical clue with scientific rigor (spectrometry, digital forensics, chemical residue, timeline correlation).
Respond strictly in JSON format matching this schema:
{
  "relevance_score": <number between 1 and 100 representing evidentiary weight>,
  "possible_owners": [<array of 1 to 3 suspect names most strongly associated or implicated by this item>],
  "analysis": "<2 to 4 sentences of clinical forensic findings, chemical/physical markers, or digital timestamps>",
  "followup_question": "<a precise, hard-hitting interrogation question the detective should confront the suspects with>"
}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.FORENSICS, // openai/gpt-oss-20b
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Run forensic scan on Evidence Tag: ${clue.name}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsed: {
      relevance_score: number;
      possible_owners: string[];
      analysis: string;
      followup_question: string;
    };

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        relevance_score: 80,
        possible_owners: [serverCase.suspects[0]?.name || "Unknown"],
        analysis: "Forensic analysis confirms residue and physical wear consistent with recent handling during the critical window.",
        followup_question: `Where were you when this ${clue.name} was handled?`,
      };
    }

    return NextResponse.json({
      clue_id: clue.id,
      relevance_score: Math.min(100, Math.max(0, Math.round(parsed.relevance_score || 75))),
      possible_owners: Array.isArray(parsed.possible_owners) ? parsed.possible_owners : [],
      analysis: parsed.analysis || "Analysis complete.",
      followup_question: parsed.followup_question || "Explain your connection to this evidence.",
    });
  } catch (error: any) {
    console.error("Forensics error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process forensics scan" },
      { status: 500 }
    );
  }
}
