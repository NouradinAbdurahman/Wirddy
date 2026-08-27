import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { processRecurringCycle } from "@/lib/groups/service"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }

  // Fetch active recurring groups
  const { data: recurringGroups, error } = await supabase
    .from("groups")
    .select("public_id, owner_user_id, recurrence, status, is_archived")
    .eq("is_archived", false)
    .eq("status", "active")
    .not("recurrence", "is", null)

  if (error || !recurringGroups) {
    return NextResponse.json(
      { processed: 0, error: error?.message },
      { status: 500 }
    )
  }

  let cyclesProcessed = 0

  for (const g of recurringGroups as any[]) {
    try {
      const recurrence = g.recurrence
      if (recurrence?.autoAdvance && recurrence?.frequency !== "none") {
        await processRecurringCycle(g.public_id, g.owner_user_id)
        cyclesProcessed++
      }
    } catch (err) {
      console.error(`Error auto-advancing group ${g.public_id}:`, err)
    }
  }

  return NextResponse.json({ success: true, cyclesProcessed })
}
