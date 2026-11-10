import { NextResponse } from "next/server";
import { getFraudAlerts } from "@/lib/fraudDetector";

export async function GET() {
  const alerts = getFraudAlerts();
  return NextResponse.json({ alerts });
}
