import { NextResponse } from "next/server";
import { getViewer } from "@/lib/viewer";

/**
 * API endpoint to get current viewer state.
 * Safe to expose - no secrets, just public session info.
 */
export async function GET() {
  const viewer = await getViewer();
  return NextResponse.json(viewer);
}



