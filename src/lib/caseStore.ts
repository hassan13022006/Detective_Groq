import { SEED_CASE } from "@/data/caseData";
import { PublicCaseData } from "@/types/mystery";
import { ServerCaseData } from "@/types/serverMystery";

// Server-side in-memory registry for cases
// In Next.js Node runtime, globalThis preserves generated cases across requests
const globalCaseMap = globalThis as unknown as {
  __detectiveCases?: Map<string, ServerCaseData>;
};

if (!globalCaseMap.__detectiveCases) {
  globalCaseMap.__detectiveCases = new Map<string, ServerCaseData>();
  globalCaseMap.__detectiveCases.set(SEED_CASE.case_id, SEED_CASE);
}

const cases = globalCaseMap.__detectiveCases;

export function getServerCase(caseId?: string | null): ServerCaseData {
  if (!caseId || !cases.has(caseId)) {
    return SEED_CASE;
  }
  return cases.get(caseId)!;
}

export function saveServerCase(caseData: ServerCaseData): void {
  cases.set(caseData.case_id, caseData);
}

export function toPublicCaseData(serverCase: ServerCaseData): PublicCaseData {
  return {
    case_id: serverCase.case_id,
    case_title: serverCase.case_title,
    victim: { ...serverCase.victim },
    clues: serverCase.clues.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    })),
    // NEVER expose secret_system_prompt or is_killer flag!
    suspects: serverCase.suspects.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      public_bio: s.public_bio,
    })),
  };
}

export function getPublicCase(caseId?: string | null): PublicCaseData {
  const serverCase = getServerCase(caseId);
  return toPublicCaseData(serverCase);
}
