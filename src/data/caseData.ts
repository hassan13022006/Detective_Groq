import { ServerCaseData } from "@/types/serverMystery";

export const SEED_CASE: ServerCaseData = {
  case_id: "midnight_gala_seed",
  case_title: "Murder at the Midnight Gala",
  victim: {
    name: "Julian Vance",
    role: "Tech Billionaire & Collector",
    cause_of_death: "Poisoned espresso martini at 11:15 PM in his private study."
  },
  clues: [
    {
      id: "clue_1",
      name: "Shattered Smart Watch",
      description: "Found under the study desk. Stopped at 11:12 PM. Heart rate spiked to 145 BPM right before stopping."
    },
    {
      id: "clue_2",
      name: "Half-Burned NDA Document",
      description: "Recovered from the fireplace. Mentions 'Project Helios' and a 40% equity clawback clause."
    },
    {
      id: "clue_3",
      name: "Traces of Bitter Almond Oil",
      description: "Found on the rim of the martini glass, matching an organic pesticide used in rare orchid cultivation."
    }
  ],
  suspects: [
    {
      id: "suspect_1",
      name: "Elena Rostova",
      role: "Co-Founder & CTO",
      public_bio: "Brilliant engineer who built Project Helios. Known to argue loudly with Julian over company control.",
      secret_system_prompt: "You are Elena Rostova. You are INNOCENT of murder, though you did burn the NDA in his fireplace at 10:45 PM because he was trying to steal your shares. You are arrogant, defensive about Project Helios, and saw Marcus leaving the study kitchen area around 11:05 PM.",
      is_killer: false
    },
    {
      id: "suspect_2",
      name: "Marcus Thorne",
      role: "Personal Sommelier & Botanist",
      public_bio: "Julian's longtime estate manager who tends to Julian's rare greenhouse orchids and mixes his evening drinks.",
      secret_system_prompt: "You are Marcus Thorne. You are THE KILLER. Julian discovered you were selling rare orchid extracts on the black market and threatened to report you. You poisoned his espresso martini using cyanide derived from bitter almond/orchid pests at 11:05 PM. Act calm, polite, and overly helpful, and subtly try to frame Elena for the argument over the NDA. Never confess unless directly confronted with BOTH the bitter almond trace and your timeline at 11:05 PM.",
      is_killer: true
    },
    {
      id: "suspect_3",
      name: "Chloe Sterling",
      role: "Investigative Journalist",
      public_bio: "Snuck into the gala to expose Julian's shady offshore accounts.",
      secret_system_prompt: "You are Chloe Sterling. You are INNOCENT. You were hiding on the balcony outside the study at 11:10 PM taking photos. You heard Julian coughing violently and saw his smart watch smash against the desk as he fell, though you didn't see who poured the drink. You are sarcastic and reluctant to admit you were trespassing.",
      is_killer: false
    }
  ],
  solution: {
    killer_id: "suspect_2",
    killer_name: "Marcus Thorne",
    motive: "Julian caught Marcus selling rare orchid extracts on the black market and threatened to report him, ruining his life and estate career.",
    method: "Marcus poisoned Julian's espresso martini at 11:05 PM with cyanide extracted from bitter almond orchid pesticide.",
    timeline: "11:05 PM Marcus serves poisoned drink; 11:12 PM Julian collapses and his watch smashes; 11:15 PM Julian dies.",
    full_truth: "Marcus Thorne poisoned the espresso martini at 11:05 PM with cyanide from bitter almond orchid pesticide because Julian caught him selling rare orchid extracts on the black market; watch smashed at 11:12 PM, death at 11:15 PM."
  }
};
