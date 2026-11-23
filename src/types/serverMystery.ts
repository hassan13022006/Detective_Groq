import { PublicClue, PublicSuspect, PublicVictim } from "./mystery";

export interface ServerSuspect extends PublicSuspect {
  secret_system_prompt: string;
  is_killer?: boolean;
}

export interface CaseSolution {
  killer_id: string;
  killer_name: string;
  motive: string;
  method: string;
  timeline: string;
  full_truth: string;
}

export interface ServerCaseData {
  case_id: string;
  case_title: string;
  victim: PublicVictim;
  clues: PublicClue[];
  suspects: ServerSuspect[];
  solution: CaseSolution;
}
