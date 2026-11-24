import { NextRequest, NextResponse } from "next/server";
import { resetServerCasesToSeed } from "@/lib/caseStore";
import { SEED_CASE } from "@/data/caseData";

export async function POST(_req: NextRequest) {
  try {
    resetServerCasesToSeed();
    return NextResponse.json({
      success: true,
      message: "Server case store successfully reset to starter case",
      seed_case_id: SEED_CASE.case_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reset server case store" },
      { status: 500 }
    );
  }
}
