"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FolderOpen,
  FileSearch,
  Users,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Scale,
  RefreshCw,
  Search,
  Key,
} from "lucide-react";
import {
  PublicCaseData,
  ChatMessage,
  ForensicsResult,
  VerdictResult,
  NotebookEntry,
} from "@/types/mystery";
import { Header } from "@/components/Header";
import { VictimCard } from "@/components/VictimCard";
import { ClueCard } from "@/components/ClueCard";
import { SuspectCard } from "@/components/SuspectCard";
import { InterrogationRoom } from "@/components/InterrogationRoom";
import { ForensicsModal } from "@/components/ForensicsModal";
import { NotebookDrawer } from "@/components/NotebookDrawer";
import { VerdictModal } from "@/components/VerdictModal";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { OnboardingTour } from "@/components/OnboardingTour";
import { soundFX } from "@/lib/soundEffects";

const INITIAL_ACTION_POINTS = 12;

export default function Home() {
  // Case Data State
  const [caseData, setCaseData] = useState<PublicCaseData | null>(null);
  const [caseLoading, setCaseLoading] = useState(true);
  const [caseError, setCaseError] = useState<string | null>(null);

  // Active Tab: "dossier" | "interrogation"
  const [activeMainTab, setActiveMainTab] = useState<"dossier" | "interrogation">("dossier");

  // Detective Action Points
  const [actionPoints, setActionPoints] = useState<number>(INITIAL_ACTION_POINTS);

  // Suspects Interrogation State
  const [activeSuspectId, setActiveSuspectId] = useState<string>("");
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [suspectNervousness, setSuspectNervousness] = useState<Record<string, number>>({});
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [prefilledPrompt, setPrefilledPrompt] = useState<string>("");

  // Forensics Scan State
  const [forensicsResults, setForensicsResults] = useState<Record<string, ForensicsResult>>({});
  const [scanningClueId, setScanningClueId] = useState<string | null>(null);
  const [activeForensicsModalClueId, setActiveForensicsModalClueId] = useState<string | null>(null);

  // Persistent Detective's Notebook
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([]);

  // Modals
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);

  // Custom API Key in client localStorage (if user doesn't use .env.local)
  const [customApiKey, setCustomApiKey] = useState<string>("");

  // Tour trigger reference
  const tourTriggerRef = useRef<(() => void) | null>(null);

  // Load custom key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("detective_groq_api_key");
      if (storedKey) setCustomApiKey(storedKey);
    }
  }, []);

  const saveCustomApiKey = (key: string) => {
    setCustomApiKey(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("detective_groq_api_key", key);
      } else {
        localStorage.removeItem("detective_groq_api_key");
      }
    }
  };

  // Helper for headers
  const getRequestHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (customApiKey) {
      headers["x-groq-api-key"] = customApiKey;
    }
    return headers;
  }, [customApiKey]);

  // Fetch Case Data (default seed or specific id)
  const loadCase = useCallback(async (caseId?: string) => {
    setCaseLoading(true);
    setCaseError(null);
    try {
      const url = caseId ? `/api/case?id=${encodeURIComponent(caseId)}` : `/api/case`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load case data");
      }
      setCaseData(data.case_data);
      if (data.case_data.suspects.length > 0) {
        setActiveSuspectId(data.case_data.suspects[0].id);
      }
      // Reset action points & interrogation state for new case
      setActionPoints(INITIAL_ACTION_POINTS);
      setChatHistories({});
      setSuspectNervousness({});
      setForensicsResults({});

      // Load persistent notebook for this specific case
      if (typeof window !== "undefined") {
        const savedNotes = localStorage.getItem(`detective_notebook_${data.case_data.case_id}`);
        if (savedNotes) {
          try {
            setNotebookEntries(JSON.parse(savedNotes));
          } catch {
            setNotebookEntries([]);
          }
        } else {
          setNotebookEntries([]);
        }
      }
    } catch (err: any) {
      setCaseError(err?.message || "Failed to load case dossier");
    } finally {
      setCaseLoading(false);
    }
  }, []);

  // Initial mount load
  useEffect(() => {
    loadCase();
  }, [loadCase]);

  // Save notebook changes to localStorage
  const saveNotebookEntries = useCallback(
    (newEntries: NotebookEntry[]) => {
      setNotebookEntries(newEntries);
      if (caseData && typeof window !== "undefined") {
        localStorage.setItem(
          `detective_notebook_${caseData.case_id}`,
          JSON.stringify(newEntries)
        );
      }
    },
    [caseData]
  );

  const handleAddNotebookEntry = (text: string) => {
    const newEntry: NotebookEntry = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      createdAt: Date.now(),
    };
    saveNotebookEntries([newEntry, ...notebookEntries]);
  };

  const handleDeleteNotebookEntry = (id: string) => {
    saveNotebookEntries(notebookEntries.filter((n) => n.id !== id));
  };

  const handlePinQuote = (suspectName: string, quote: string) => {
    const newEntry: NotebookEntry = {
      id: `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: quote,
      pinnedQuote: {
        suspectName,
        quote,
        timestamp: Date.now(),
      },
      createdAt: Date.now(),
    };
    saveNotebookEntries([newEntry, ...notebookEntries]);
    setNotebookOpen(true);
  };

  // Interrogate Suspect Handler
  const handleSendMessage = async (
    suspectId: string,
    messageText: string,
    presentedClueId?: string
  ) => {
    if (!caseData || actionPoints <= 0) return;

    // Deduct 1 Action Point per question
    setActionPoints((prev) => Math.max(0, prev - 1));

    const clueObj = caseData.clues.find((c) => c.id === presentedClueId);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: Date.now(),
      presentedClueName: clueObj ? clueObj.name : undefined,
    };

    const currentHistory = chatHistories[suspectId] || [];
    const updatedHistoryWithUser = [...currentHistory, userMsg];

    setChatHistories((prev) => ({
      ...prev,
      [suspectId]: updatedHistoryWithUser,
    }));

    setIsInterrogating(true);

    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          case_id: caseData.case_id,
          suspect_id: suspectId,
          messages: updatedHistoryWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          presented_clue_id: presentedClueId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to interrogate suspect");
      }

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        nervousness: data.nervousness,
        timestamp: Date.now(),
      };

      setChatHistories((prev) => ({
        ...prev,
        [suspectId]: [...updatedHistoryWithUser, assistantMsg],
      }));

      if (typeof data.nervousness === "number") {
        setSuspectNervousness((prev) => ({
          ...prev,
          [suspectId]: data.nervousness,
        }));
      }
    } catch (err: any) {
      console.error(err);
      // Fallback message showing error / API key reminder
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `*A sudden silence hangs in the room. The detective's radio crackles with an error: "${err.message}". Verify your GROQ_API_KEY.*`,
        nervousness: 0,
        timestamp: Date.now(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [suspectId]: [...updatedHistoryWithUser, errMsg],
      }));
    } finally {
      setIsInterrogating(false);
    }
  };

  // Ask AI Forensics Handler (deducts 2 Action Points)
  const handleAskForensics = async (clueId: string) => {
    if (!caseData) return;

    // If already scanned, just open modal without deducting points
    if (forensicsResults[clueId]) {
      setActiveForensicsModalClueId(clueId);
      return;
    }

    if (actionPoints < 2) {
      alert("Insufficient Action Points! Forensic lab analysis requires 2 AP.");
      return;
    }

    // Deduct 2 Action Points
    setActionPoints((prev) => Math.max(0, prev - 2));
    setScanningClueId(clueId);

    try {
      const res = await fetch("/api/forensics", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          case_id: caseData.case_id,
          clue_id: clueId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Forensic scan failed");
      }

      setForensicsResults((prev) => ({
        ...prev,
        [clueId]: data,
      }));
      setActiveForensicsModalClueId(clueId);
    } catch (err: any) {
      alert(`Forensics Lab Error: ${err.message}. Please check your GROQ_API_KEY.`);
    } finally {
      setScanningClueId(null);
    }
  };

  // Verdict Submission
  const handleSubmitVerdict = async (
    accusedId: string,
    theory: string,
    motive: string,
    method: string
  ): Promise<VerdictResult | null> => {
    if (!caseData) return null;

    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          case_id: caseData.case_id,
          accused_suspect_id: accusedId,
          theory,
          motive,
          method,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Chief verdict grading failed");
      }
      return data as VerdictResult;
    } catch (err: any) {
      alert(`Chief Henderson could not review your warrant: ${err.message}. Check GROQ_API_KEY.`);
      return null;
    }
  };

  // Generate New Solvable Mystery
  const handleGenerateNewCase = async () => {
    setIsGeneratingCase(true);
    try {
      const res = await fetch("/api/generate-case", {
        method: "POST",
        headers: getRequestHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate new case");
      }

      setCaseData(data.case_data);
      if (data.case_data.suspects.length > 0) {
        setActiveSuspectId(data.case_data.suspects[0].id);
      }
      setActionPoints(INITIAL_ACTION_POINTS);
      setChatHistories({});
      setSuspectNervousness({});
      setForensicsResults({});
      setNotebookEntries([]);
      setActiveMainTab("dossier");
      setVerdictModalOpen(false);
      soundFX.playStamp();
    } catch (err: any) {
      alert(`Failed to generate new mystery: ${err.message}. Ensure GROQ_API_KEY is configured.`);
    } finally {
      setIsGeneratingCase(false);
    }
  };

  // Active clue for forensics modal
  const activeClueForForensics = caseData?.clues.find(
    (c) => c.id === activeForensicsModalClueId
  ) || null;

  return (
    <div className="min-h-screen bg-noir-950 text-noir-100 flex flex-col noir-vignette scanlines relative">
      {/* Interactive Onboarding Walkthrough */}
      <OnboardingTour
        onRegisterTrigger={(triggerFn) => {
          tourTriggerRef.current = triggerFn;
        }}
      />

      {/* Top Police Precinct Header */}
      <Header
        caseTitle={caseData?.case_title || "Loading Case..."}
        actionPoints={actionPoints}
        onOpenNotebook={() => setNotebookOpen(true)}
        onOpenVerdict={() => setVerdictModalOpen(true)}
        onGenerateNewCase={handleGenerateNewCase}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        onStartTour={() => {
          if (tourTriggerRef.current) {
            tourTriggerRef.current();
          } else if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("start-detective-tour"));
          }
        }}
        notebookNotesCount={notebookEntries.length}
        isGeneratingCase={isGeneratingCase}
        hasCustomKey={Boolean(customApiKey)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (Case Dossier vs Interrogation Room) */}
        <div className="flex items-center justify-between border-b border-noir-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              data-tour="case-dossier"
              onClick={() => {
                soundFX.playPaperRustle();
                setActiveMainTab("dossier");
              }}
              className={`px-4 py-2 rounded text-xs font-typewriter font-bold flex items-center gap-2 transition ${
                activeMainTab === "dossier"
                  ? "bg-noir-850 text-amber-400 border border-noir-700 shadow-md"
                  : "text-noir-400 hover:text-noir-200 hover:bg-noir-900"
              }`}
            >
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>CASE DOSSIER</span>
            </button>

            <button
              data-tour="interrogation-tab"
              onClick={() => {
                soundFX.playPaperRustle();
                setActiveMainTab("interrogation");
              }}
              className={`px-4 py-2 rounded text-xs font-typewriter font-bold flex items-center gap-2 transition ${
                activeMainTab === "interrogation"
                  ? "bg-noir-850 text-amber-400 border border-noir-700 shadow-md"
                  : "text-noir-400 hover:text-noir-200 hover:bg-noir-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-rose-500" />
              <span>INTERROGATION CHAMBER</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>
          </div>

          <div className="text-[11px] font-typewriter text-noir-400 hidden sm:block">
            {caseData?.case_title}
          </div>
        </div>

        {/* Loading / Error state */}
        {caseLoading && (
          <div className="py-20 text-center font-typewriter text-noir-400 space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Unsealing confidential homicide dossier...</p>
          </div>
        )}

        {caseError && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-lg text-rose-300 font-typewriter text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Dossier Access Error</span>
            </div>
            <p>{caseError}</p>
            <button
              onClick={() => loadCase()}
              className="px-3 py-1 bg-rose-900 text-rose-100 rounded text-xs font-bold uppercase hover:bg-rose-800"
            >
              Retry Opening File
            </button>
          </div>
        )}

        {/* Tab 1: Case Dossier Dashboard */}
        {!caseLoading && caseData && activeMainTab === "dossier" && (
          <div className="space-y-6">
            {/* 1. Victim & Crime Scene Summary */}
            <VictimCard
              victim={caseData.victim}
              caseTitle={caseData.case_title}
            />

            {/* 2. Physical Evidence & Clues Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-typewriter uppercase tracking-wider font-bold text-cyan-400">
                    Physical Evidence &amp; Crime Scene Artifacts (3 Items)
                  </h3>
                </div>
                <span className="text-[10px] font-typewriter text-noir-400">
                  Forensic Scan costs 2 Action Points
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseData.clues.map((clue, idx) => (
                  <ClueCard
                    key={clue.id}
                    clue={clue}
                    index={idx}
                    forensicsResult={forensicsResults[clue.id]}
                    isScanning={scanningClueId === clue.id}
                    actionPoints={actionPoints}
                    onAskForensics={handleAskForensics}
                    onSelectForInterrogation={(clueId) => {
                      setActiveMainTab("interrogation");
                      setPrefilledPrompt(
                        `Confront suspect with evidence: ${clue.name}`
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3. Persons of Interest / Suspect Lineup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-typewriter uppercase tracking-wider font-bold text-amber-400">
                    Suspect Lineup &amp; Persons of Interest (3 Suspects)
                  </h3>
                </div>
                <span className="text-[10px] font-typewriter text-noir-400">
                  Select a suspect to bring them into the Interrogation Room
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {caseData.suspects.map((suspect, idx) => (
                  <SuspectCard
                    key={suspect.id}
                    suspect={suspect}
                    index={idx}
                    isActive={suspect.id === activeSuspectId}
                    nervousness={suspectNervousness[suspect.id] || 20}
                    messageCount={(chatHistories[suspect.id] || []).length}
                    onInterrogate={(id) => {
                      setActiveSuspectId(id);
                      setActiveMainTab("interrogation");
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Interrogation Room */}
        {!caseLoading && caseData && activeMainTab === "interrogation" && (
          <InterrogationRoom
            suspects={caseData.suspects}
            clues={caseData.clues}
            activeSuspectId={activeSuspectId}
            onSelectSuspect={setActiveSuspectId}
            chatHistories={chatHistories}
            suspectNervousness={suspectNervousness}
            onSendMessage={handleSendMessage}
            onPinQuote={handlePinQuote}
            actionPoints={actionPoints}
            isLoading={isInterrogating}
            prefilledPrompt={prefilledPrompt}
            onClearPrefilledPrompt={() => setPrefilledPrompt("")}
          />
        )}
      </main>

      {/* Persistent Detective's Notebook Drawer */}
      <NotebookDrawer
        isOpen={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        entries={notebookEntries}
        onAddEntry={handleAddNotebookEntry}
        onDeleteEntry={handleDeleteNotebookEntry}
      />

      {/* Forensic Lab Analysis Modal */}
      <ForensicsModal
        clue={activeClueForForensics}
        result={activeClueForForensics ? forensicsResults[activeClueForForensics.id] || null : null}
        isOpen={Boolean(activeForensicsModalClueId)}
        onClose={() => setActiveForensicsModalClueId(null)}
        onUseFollowupInInterrogation={(question) => {
          setActiveForensicsModalClueId(null);
          setActiveMainTab("interrogation");
          setPrefilledPrompt(question);
        }}
      />

      {/* Final Verdict / Accuse Suspect Modal */}
      {caseData && (
        <VerdictModal
          isOpen={verdictModalOpen}
          onClose={() => setVerdictModalOpen(false)}
          suspects={caseData.suspects}
          onSubmitVerdict={handleSubmitVerdict}
          onNewMystery={handleGenerateNewCase}
        />
      )}

      {/* Detective API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={customApiKey}
        onSaveKey={saveCustomApiKey}
      />
    </div>
  );
}
