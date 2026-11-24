import fs from "fs";
import path from "path";
import { SEED_CASE } from "@/data/caseData";
import { PublicCaseData } from "@/types/mystery";
import { ServerCaseData } from "@/types/serverMystery";

const ARCHIVE_FILE = path.join(process.cwd(), "src", "data", "casesArchive.json");

// Server-side in-memory registry for cases
// In Next.js Node runtime, globalThis preserves generated cases across requests
const globalCaseMap = globalThis as unknown as {
  __detectiveCases?: Map<string, ServerCaseData>;
};

function loadCasesFromDisk(): Map<string, ServerCaseData> {
  const map = new Map<string, ServerCaseData>();
  map.set(SEED_CASE.case_id, SEED_CASE);

  try {
    if (fs.existsSync(ARCHIVE_FILE)) {
      const raw = fs.readFileSync(ARCHIVE_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const c of list) {
          if (c && c.case_id) {
            map.set(c.case_id, c);
          }
        }
      }
    }
  } catch (err) {
    console.error("Could not read casesArchive.json from disk:", err);
  }

  return map;
}

if (!globalCaseMap.__detectiveCases) {
  globalCaseMap.__detectiveCases = loadCasesFromDisk();
}

const cases = globalCaseMap.__detectiveCases;

export function getServerCase(caseId?: string | null): ServerCaseData {
  if (!caseId || !cases.has(caseId)) {
    // Attempt fallback from disk if not in memory
    try {
      if (fs.existsSync(ARCHIVE_FILE)) {
        const raw = fs.readFileSync(ARCHIVE_FILE, "utf-8");
        const list = JSON.parse(raw) as ServerCaseData[];
        const found = list.find((c) => c.case_id === caseId);
        if (found) {
          cases.set(found.case_id, found);
          return found;
        }
      }
    } catch {}
    return SEED_CASE;
  }
  return cases.get(caseId)!;
}

export function saveServerCase(caseData: ServerCaseData): void {
  cases.set(caseData.case_id, caseData);
  try {
    const list = Array.from(cases.values());
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not persist case to casesArchive.json:", err);
  }
}

export function resetServerCasesToSeed(): void {
  cases.clear();
  cases.set(SEED_CASE.case_id, SEED_CASE);
  try {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify([SEED_CASE], null, 2), "utf-8");
  } catch (err) {
    console.error("Could not reset casesArchive.json on disk:", err);
  }
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
