import { NextRequest, NextResponse } from "next/server";
import { getPublicCase } from "@/lib/caseStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("id");
    const publicData = getPublicCase(caseId);
    return NextResponse.json({ success: true, case_data: publicData });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load case data" },
      { status: 500 }
    );
  }
}
