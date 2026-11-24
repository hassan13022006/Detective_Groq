"use client";

import { useEffect, useCallback, useRef } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";

export const TOUR_STORAGE_KEY = "detectives_desk_tour_done";

export function createDetectiveTour(): Driver {
  const driverObj: Driver = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickBehavior: "close",
    showButtons: ["next", "previous", "close"],
    stagePadding: 6,
    stageRadius: 6,
    popoverClass: "detective-tour-popover",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Understood, Detective ✓",
    progressText: "Step {{current}} of {{total}}",
    onDestroyed: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        document.body.classList.remove(
          "driver-active",
          "driver-fade",
          "driver-simple",
          "driver-no-scroll"
        );
        document
          .querySelectorAll(".driver-overlay, .driver-popover")
          .forEach((el) => el.remove());
      }
    },
    steps: [
      {
        popover: {
          title: "🕵️ Welcome to The Detective's Desk",
          description:
            "A ruthless murder has taken place at the Midnight Gala. Your mission: inspect physical clues, interrogate suspects, analyze stress reactions, and catch the killer before running out of Action Points.",
        },
      },
      {
        element: '[data-tour="action-points"]',
        popover: {
          title: "⚡ Action Points (AP) Budget",
          description:
            "You start with 12 AP. Asking a suspect a question costs 1 AP; running a Forensic Scan costs 2 AP. Spend your points wisely to avoid running out of leads!",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="case-dossier"]',
        popover: {
          title: "📂 Evidence & Forensics",
          description:
            "Review the victim report, run Forensic Scan (2 AP) for AI lab insights, or click 'Present in Room' to confront a suspect directly with physical evidence.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="interrogation-tab"]',
        popover: {
          title: "🔎 Suspect Interrogation",
          description:
            "Question all 3 suspects with multi-turn dialogues. Observe their live pulse/nervousness meter spike when cornered, and click the Pin (📌) icon on suspicious replies to save quotes.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="notebook-btn"]',
        popover: {
          title: "📓 Detective's Notebook",
          description:
            "View your pinned suspect quotes and type your own timeline notes (saved automatically in your browser).",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="new-mystery-btn"]',
        popover: {
          title: "✨ Infinite AI Cases",
          description:
            "Ready for another crime? Click here to generate a brand-new solvable mystery from scratch powered by gpt-oss-120b.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: '[data-tour="accuse-btn"]',
        popover: {
          title: "⚖️ Make Your Final Accusation",
          description:
            "Once you know who did it, how, and why, click here to present your case to the Chief of Police for the final verdict.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: '[data-tour="case-history"]',
        popover: {
          title: "📁 Case History & Attempt Log",
          description:
            "Every mystery you investigate, your attempt history, and score percentages are archived in this tab. Re-attempt any case anytime without spoiling the killer!",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="settings-menu-btn"]',
        popover: {
          title: "⚙️ Precinct Settings & Utilities",
          description:
            "Open this menu anytime to toggle audio FX, configure your Groq API key, replay this walkthrough guide, or perform a full precinct app reset.",
          side: "bottom",
          align: "end",
        },
      },
    ],
  });

  return driverObj;
}

interface OnboardingTourProps {
  onRegisterTrigger?: (trigger: () => void) => void;
}

export function OnboardingTour({ onRegisterTrigger }: OnboardingTourProps) {
  const driverRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;
    if (driverRef.current) {
      try {
        driverRef.current.destroy();
      } catch {}
    }
    const d = createDetectiveTour();
    driverRef.current = d;
    d.drive();
  }, []);

  useEffect(() => {
    if (onRegisterTrigger) {
      onRegisterTrigger(startTour);
    }

    const handleCustomTrigger = () => {
      startTour();
    };
    window.addEventListener("start-detective-tour", handleCustomTrigger);

    // Auto-launch on first visit after 600ms delay so dashboard renders first
    const isTourDone = localStorage.getItem(TOUR_STORAGE_KEY);
    let timer: NodeJS.Timeout | null = null;
    if (isTourDone !== "true") {
      timer = setTimeout(() => {
        startTour();
      }, 600);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("start-detective-tour", handleCustomTrigger);
      if (driverRef.current) {
        try {
          driverRef.current.destroy();
        } catch {}
      }
      document.body.classList.remove(
        "driver-active",
        "driver-fade",
        "driver-simple",
        "driver-no-scroll"
      );
      document
        .querySelectorAll(".driver-overlay, .driver-popover")
        .forEach((el) => el.remove());
    };
  }, [startTour, onRegisterTrigger]);

  return null;
}
