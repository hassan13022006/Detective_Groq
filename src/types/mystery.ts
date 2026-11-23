export interface PublicVictim {
  name: string;
  role: string;
  cause_of_death: string;
}

export interface PublicClue {
  id: string;
  name: string;
  description: string;
}

export interface PublicSuspect {
  id: string;
  name: string;
  role: string;
  public_bio: string;
}

export interface PublicCaseData {
  case_id: string;
  case_title: string;
  victim: PublicVictim;
  clues: PublicClue[];
  suspects: PublicSuspect[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  nervousness?: number; // 0 - 100
  presentedClueName?: string;
}

export interface ForensicsResult {
  clue_id: string;
  relevance_score: number; // 0 - 100
  possible_owners: string[];
  analysis: string;
  followup_question: string;
}

export interface VerdictResult {
  is_correct: boolean;
  score: number; // 0 - 100
  feedback: string;
  breakdown?: {
    culprit_identified: boolean;
    motive_accuracy: number;
    method_accuracy: number;
    timeline_accuracy: number;
  };
}

export interface NotebookEntry {
  id: string;
  text: string;
  pinnedQuote?: {
    suspectName: string;
    quote: string;
    timestamp: number;
  };
  createdAt: number;
}
