import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { saveServerCase, toPublicCaseData } from "@/lib/caseStore";
import { ServerCaseData } from "@/types/serverMystery";

// 12+ Distinct Venues / Eras
const SETTINGS = [
  "Antarctic Research Outpost in the dead of winter during a blinding blizzard",
  "Kyoto Heritage Auction House during a secretive midnight sale of imperial artifacts",
  "Formula 1 Paddock Garage during a high-stakes Grand Prix night race in Monaco",
  "1920s Sleeper Express Train crossing an avalanche-blocked Alpine pass",
  "Orbital Solar Refinery platform in low Earth orbit during a communications blackout",
  "Alpine Clockmaker's Secluded Estate surrounded by ancient clockwork towers and snowdrifts",
  "Underground High-Stakes Chess Championship held in a decommissioned Cold War missile bunker",
  "Venetian Glassworks atelier situated on the foggy canals of Murano Island",
  "Sunken Submarine Salvage Ship operating in stormy international waters",
  "Rooftop Botanical Conservatory and poisonous orchid nursery overlooking a rainy cyberpunk metropolis",
  "Desert Radio Telescope Array outpost in the Atacama Desert during a stellar solar storm",
  "Symphony Orchestra Backstage auditorium just minutes before a world premiere concert",
  "Remote Lighthouse Island station cut off by a gale-force hurricane",
  "Deep-Sea Marine Biology Habitat submerged 400 meters under the Pacific Ocean",
  "Historic Highland Castle Whisky Distillery during an exclusive private barrel tasting",
];

// Murder Methods
const MURDER_METHODS = [
  "tampered scuba regulator releasing carbon monoxide instead of pure oxygen",
  "lethal dose of rare bitter neurotoxin concealed inside a ceremonial herbal tea infusion",
  "rigged heavy stage counterweight dropped from the overhead fly loft",
  "sabotaged decompression/hyperbaric chamber pressure seal valve",
  "electrocution disguised as an accidental telemetry console surge",
  "subtle synthetic cardiac arrest agent injected via a hollowed vintage fountain pen nib",
  "freeze-damaged hydraulic brake line intentionally snipped with custom wirecutters",
  "fatal exposure to an industrial cryogenic coolant coolant valve opened manually",
  "poisoned vintage wine goblet treated with colorless odorless cyanide crystals",
  "rigged high-voltage audio amplifier feed during microphone sound check",
  "pure nicotine concentrate slipped into a bespoke menthol cigarette",
  "lethal snake venom extract applied to the spine of an antique book",
];

// Name Pools & Cultural Backgrounds
const NAME_POOLS = [
  {
    culture: "Japanese / East Asian Heritage",
    victims: ["Kenji Takahashi", "Dr. Renjiro Sato", "Lady Shizuka Mori", "Akira Tanaka"],
    suspects: ["Hana Ishikawa", "Jiro Matsuo", "Yuki Vance-Kato", "Kaito Shimizu", "Dr. Mei Lin"],
  },
  {
    culture: "European / Alpine Heritage",
    victims: ["Baron Henrik von Klaus", "Alain Beaumont", "Matthias Vogel", "Countess Eléonore Mercier"],
    suspects: ["Soren Lindqvist", "Isolde Wagner", "Claire Laurent", "Bruno Weber", "Astrid Lind"],
  },
  {
    culture: "Mediterranean / Italian Heritage",
    victims: ["Enzo Marchetti", "Donato Bellini", "Matteo Rossi", "Giulia De Luca"],
    suspects: ["Dante Romano", "Alessia Conti", "Marco Santoro", "Vittoria Moretti", "Giancarlo Fabbri"],
  },
  {
    culture: "Anglo / International Elite",
    victims: ["Alistair Sterling", "Cedric Vance-Sinclair", "Reginald Montgomery", "Lord Percival Cross"],
    suspects: ["Evelyn Cross", "Julian Sharpe", "Gideon Drake", "Rowan Hastings", "Vivienne Vance"],
  },
  {
    culture: "Latin American Heritage",
    victims: ["Dr. Santiago Morales", "Mateo Valenzuela", "Gonzalo Navarro", "Camila Reyes"],
    suspects: ["Valentina Vega", "Esteban Silva", "Sofia Mendoza", "Rodrigo Cruz", "Lucia Herrera"],
  },
  {
    culture: "Nordic Heritage",
    victims: ["Thorvald Holm", "Einar Lindgren", "Dr. Freja Nygård", "Magnus Berg"],
    suspects: ["Sigrid Lind", "Kasper Solberg", "Astrid Eriksen", "Henrik Dahl", "Lovisa Blom"],
  },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function POST(req: NextRequest) {
  try {
    const customKey = req.headers.get("x-groq-api-key");
    const groq = getGroqClient(customKey);

    // Read optional client-provided filters (past titles & past names to avoid)
    let usedTitles: string[] = [];
    let usedNames: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.usedTitles)) usedTitles = body.usedTitles;
      if (Array.isArray(body?.usedNames)) usedNames = body.usedNames;
    } catch {
      // Body may be empty on direct calls
    }

    const newCaseId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Pick 1 random Setting, 1 Murder Method, and 1 Name Style
    const chosenSetting = getRandomItem(SETTINGS);
    const chosenMethod = getRandomItem(MURDER_METHODS);
    const chosenNamePool = getRandomItem(NAME_POOLS);

    // Shuffle and pick suggested names that haven't been used recently
    const candidateVictims = chosenNamePool.victims.filter((n) => !usedNames.includes(n));
    const chosenVictimName = candidateVictims.length > 0 ? getRandomItem(candidateVictims) : getRandomItem(chosenNamePool.victims);

    const candidateSuspects = shuffle(chosenNamePool.suspects.filter((n) => !usedNames.includes(n) && n !== chosenVictimName));
    const suggestedSuspectNames = candidateSuspects.slice(0, 3);

    const forbiddenTitlesClause = usedTitles.length > 0
      ? `DO NOT use or mimic any of these previously used titles: ${JSON.stringify(usedTitles.slice(-8))}.`
      : `DO NOT use generic titles like "Midnight at the Marrow Club", "Midnight at the Marlowe Club", or "Murder at the Midnight Gala".`;

    const forbiddenNamesClause = usedNames.length > 0
      ? `DO NOT use any of these previously used character names: ${JSON.stringify(usedNames.slice(-12))}.`
      : "";

    const systemPrompt = `You are a master mystery writer and puzzle architect creating an intricate, unique, and 100% solvable 3-suspect murder mystery for a detective noir investigation game.

MANDATORY SEED CREATIVE CONSTRAINTS:
- SETTING / ATMOSPHERE: "${chosenSetting}". Immerse the crime scene, victim, and clues in this venue.
- METHOD OF MURDER: "${chosenMethod}".
- CULTURAL ATMOSPHERE / NAMES: Style names around ${chosenNamePool.culture}.
  * Suggested Victim Name: "${chosenVictimName}"
  * Suggested Suspect Names: ${JSON.stringify(suggestedSuspectNames)}
- ${forbiddenTitlesClause}
- ${forbiddenNamesClause}

CORE REQUIREMENTS:
1. Generate an entirely new mystery case with:
   - A dramatic, evocative case title reflecting the setting (e.g., "The Frostbite Protocol", "Aria of the Broken String", "Silent Depths of Murano", "The 10,000 RPM Secret").
   - A distinct victim with name, wealthy or influential role, and specific cause & time of death matching the chosen murder method.
   - Exactly 3 physical clues found at the crime scene. Each clue must have id: "clue_1", "clue_2", "clue_3", name, and detailed description.
   - Exactly 3 distinct suspects with id: "suspect_1", "suspect_2", "suspect_3".
     * EXACTLY ONE of the suspects must be THE KILLER ("is_killer": true).
     * The other two suspects must be INNOCENT ("is_killer": false) but have compelling secrets, lies, or alibi complications making them plausible red herrings.
     * Each suspect must have a "name", "role", "public_bio", and "secret_system_prompt".
     * The killer's "secret_system_prompt" MUST explicitly specify their guilt, exact motive, exact method used, and state they must act innocent until confronted with key evidence and timeline.
     * The innocent suspects' "secret_system_prompt" MUST state they are innocent, explain what they were doing, what suspicious thing they did (e.g. snooping, stealing a file, eavesdropping), and what clue they might have noticed.
   - A ground-truth "solution" object containing:
     * "killer_id" (e.g. "suspect_1", "suspect_2", or "suspect_3")
     * "killer_name"
     * "motive"
     * "method"
     * "timeline"
     * "full_truth" (a 2-sentence canonical summary of the murder)

2. Keep all clue descriptions, suspect bios, secret prompts, and solution strings punchy, focused, and concise (1 to 2 sentences each) to ensure rapid, reliable JSON output without truncation.

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
        {
          role: "user",
          content: `Generate an airtight, unique noir murder mystery in the "${chosenSetting}" setting using "${chosenMethod}". Return JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      presence_penalty: 0.4,
      max_completion_tokens: 4096,
      reasoning_effort: "low",
    } as any);

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
    let killerSuspect = generatedCase.suspects.find((s) => s.id === generatedCase.solution.killer_id);
    if (!killerSuspect) {
      killerSuspect = generatedCase.suspects.find((s) => s.is_killer) || generatedCase.suspects[0];
    }
    
    // Exactly one killer
    generatedCase.suspects.forEach((s) => {
      s.is_killer = s.id === killerSuspect!.id;
    });
    generatedCase.solution.killer_id = killerSuspect.id;
    generatedCase.solution.killer_name = killerSuspect.name;

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
