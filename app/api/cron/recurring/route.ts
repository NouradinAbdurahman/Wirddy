import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { advanceRecurringGroupIfDue } from "@/lib/groups/service"
import { isAuthorizedCronRequest } from "@/lib/auth/cron"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }

  const now = new Date()
  const { data: dueGroups, error } = await supabase
    .from("groups")
    .select("public_id")
    .eq("is_archived", false)
    .not("next_cycle_due_at", "is", null)
    .lte("next_cycle_due_at", now.toISOString())

  if (error || !dueGroups) {
    return NextResponse.json({ processed: 0, error: error?.message }, { status: 500 })
  }

  let cyclesProcessed = 0
  for (const g of dueGroups as Array<{ public_id: string }>) {
    try {
      if (await advanceRecurringGroupIfDue(g.public_id, now)) cyclesProcessed++
    } catch (err) {
      console.error(`Error auto-advancing group ${g.public_id}:`, err)
    }
  }

  return NextResponse.json({ success: true, cyclesProcessed })
}

export const POST = GET
