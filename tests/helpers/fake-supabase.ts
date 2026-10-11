/* eslint-disable @typescript-eslint/no-explicit-any -- test double for the untyped PostgREST wire format */
import { randomUUID } from "crypto"

/**
 * Minimal in-memory stand-in for the Supabase JS client, used to test the
 * service layer against real query shapes. It mimics two Postgres behaviors
 * that matter for correctness:
 *
 * - Comparing a uuid column with a non-uuid string fails the whole query
 *   (Postgres error 22P02), as the real database does.
 * - Deleting a parent row cascades to its children.
 *
 * Column projections in `select()` are ignored; full rows are returned.
 */

type Row = Record<string, any>

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const UUID_COLUMNS: Record<string, string[]> = {
  groups: ["id", "owner_user_id", "recurring_source_group_id"],
  group_members: ["id", "group_id", "linked_user_id"],
  schedule_plans: ["id", "group_id"],
  schedule_weeks: ["id", "schedule_plan_id"],
  schedule_assignments: ["id", "schedule_week_id", "member_id"],
  reading_progress: ["id", "group_id", "member_id", "user_id"],
  bookmarks: ["id", "user_id"],
  notification_preferences: ["id", "user_id"],
  push_subscriptions: ["id", "user_id"],
  schedule_history: ["id", "group_id"],
  announcements: ["id", "group_id"],
}

/** child table -> [foreign key column, parent table] */
const CASCADES: Array<[string, string, string]> = [
  ["group_members", "group_id", "groups"],
  ["schedule_plans", "group_id", "groups"],
  ["schedule_history", "group_id", "groups"],
  ["announcements", "group_id", "groups"],
  ["reading_progress", "group_id", "groups"],
  ["schedule_weeks", "schedule_plan_id", "schedule_plans"],
  ["schedule_assignments", "schedule_week_id", "schedule_weeks"],
  ["schedule_assignments", "member_id", "group_members"],
  ["reading_progress", "member_id", "group_members"],
]

const DEFAULTS: Record<string, () => Row> = {
  groups: () => ({
    expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_user_id: null,
    recurrence: null,
    recurring_source_group_id: null,
    cycle_index: 1,
    is_archived: false,
    status: "active",
  }),
  group_members: () => ({ linked_user_id: null }),
}

type Filter = (row: Row) => boolean

export class FakeSupabase {
  tables: Record<string, Row[]> = {}
  deletedAuthUsers: string[] = []
  rpcCalls: Array<{ fn: string; args: any }> = []
  rpcHandler: ((fn: string, args: any) => { data: any; error: any }) | null = null

  auth = {
    admin: {
      deleteUser: async (id: string) => {
        this.deletedAuthUsers.push(id)
        return { data: {}, error: null }
      },
    },
  }

  table(name: string): Row[] {
    if (!this.tables[name]) this.tables[name] = []
    return this.tables[name]
  }

  from(name: string) {
    return new FakeQuery(this, name)
  }

  async rpc(fn: string, args: any) {
    this.rpcCalls.push({ fn, args })
    if (this.rpcHandler) return this.rpcHandler(fn, args)
    return { data: null, error: { code: "PGRST202", message: "function not found" } }
  }

  removeRows(name: string, rows: Row[]) {
    const ids = new Set(rows.map((r) => r.id))
    this.tables[name] = this.table(name).filter((r) => !ids.has(r.id))
    for (const [child, fk, parent] of CASCADES) {
      if (parent !== name) continue
      const doomed = this.table(child).filter((r) => ids.has(r[fk]))
      if (doomed.length) this.removeRows(child, doomed)
    }
  }
}

class FakeQuery implements PromiseLike<{ data: any; error: any; count?: number }> {
  private filters: Filter[] = []
  private uuidError: string | null = null
  private op: "select" | "insert" | "update" | "upsert" | "delete" = "select"
  private payload: any = null
  private conflictCols: string[] = []
  private returnRows = false
  private singleMode: "single" | "maybe" | null = null
  private orderBy: { col: string; asc: boolean } | null = null
  private limitN: number | null = null
  private countMode = false

  constructor(
    private db: FakeSupabase,
    private name: string
  ) {}

  private checkUuid(col: string, value: unknown) {
    if (
      (UUID_COLUMNS[this.name] || []).includes(col) &&
      value !== null &&
      value !== undefined &&
      !UUID_RE.test(String(value))
    ) {
      this.uuidError = `invalid input syntax for type uuid: "${value}"`
    }
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === "select") this.op = "select"
    else this.returnRows = true
    if (opts?.count) this.countMode = true
    return this
  }
  insert(rows: any) {
    this.op = "insert"
    this.payload = rows
    return this
  }
  update(patch: any) {
    this.op = "update"
    this.payload = patch
    return this
  }
  upsert(rows: any, opts?: { onConflict?: string }) {
    this.op = "upsert"
    this.payload = rows
    this.conflictCols = (opts?.onConflict || "id").split(",").map((c) => c.trim())
    return this
  }
  delete() {
    this.op = "delete"
    return this
  }
  eq(col: string, value: any) {
    this.checkUuid(col, value)
    this.filters.push((r) => r[col] === value)
    return this
  }
  neq(col: string, value: any) {
    this.checkUuid(col, value)
    this.filters.push((r) => r[col] !== value)
    return this
  }
  is(col: string, value: any) {
    this.filters.push((r) => (value === null ? r[col] === null || r[col] === undefined : r[col] === value))
    return this
  }
  not(col: string, op: string, value: any) {
    if (op === "is" && value === null) {
      this.filters.push((r) => r[col] !== null && r[col] !== undefined)
    } else if (op === "in") {
      const list = String(value).replace(/[()]/g, "").split(",").filter(Boolean)
      this.filters.push((r) => !list.includes(String(r[col])))
    }
    return this
  }
  in(col: string, values: any[]) {
    values.forEach((v) => this.checkUuid(col, v))
    this.filters.push((r) => values.includes(r[col]))
    return this
  }
  lte(col: string, value: any) {
    this.filters.push((r) => r[col] <= value)
    return this
  }
  gte(col: string, value: any) {
    this.filters.push((r) => r[col] >= value)
    return this
  }
  lt(col: string, value: any) {
    this.filters.push((r) => r[col] < value)
    return this
  }
  or(expr: string) {
    const parts = expr.split(",").map((p) => {
      const [col, op, ...rest] = p.split(".")
      const value = rest.join(".")
      if (op === "eq") this.checkUuid(col, value)
      return (r: Row) => (op === "eq" ? String(r[col]) === value : false)
    })
    this.filters.push((r) => parts.some((f) => f(r)))
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, asc: opts?.ascending !== false }
    return this
  }
  limit(n: number) {
    this.limitN = n
    return this
  }
  single() {
    this.singleMode = "single"
    return this
  }
  maybeSingle() {
    this.singleMode = "maybe"
    return this
  }

  private matches(): Row[] {
    return this.db.table(this.name).filter((r) => this.filters.every((f) => f(r)))
  }

  private finish(rows: Row[]) {
    let out = rows.map((r) => ({ ...r }))
    if (this.orderBy) {
      const { col, asc } = this.orderBy
      out.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (asc ? 1 : -1))
    }
    if (this.limitN !== null) out = out.slice(0, this.limitN)
    if (this.singleMode) {
      if (out.length === 1) return { data: out[0], error: null }
      if (out.length === 0 && this.singleMode === "maybe") return { data: null, error: null }
      return {
        data: null,
        error: { code: "PGRST116", message: `expected 1 row, got ${out.length}` },
      }
    }
    return { data: out, error: null, count: this.countMode ? out.length : undefined }
  }

  private execute(): { data: any; error: any; count?: number } {
    if (this.uuidError) {
      return { data: null, error: { code: "22P02", message: this.uuidError } }
    }
    const table = this.db.table(this.name)
    switch (this.op) {
      case "select":
        return this.finish(this.matches())
      case "insert": {
        const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]).map(
          (r: Row): Row => ({ ...(DEFAULTS[this.name]?.() || {}), id: randomUUID(), ...r })
        )
        for (const r of rows) {
          for (const col of UUID_COLUMNS[this.name] || []) this.checkUuid(col, r[col])
        }
        if (this.uuidError) return { data: null, error: { code: "22P02", message: this.uuidError } }
        table.push(...rows)
        return this.returnRows || this.singleMode ? this.finish(rows) : { data: null, error: null }
      }
      case "update": {
        const rows = this.matches()
        rows.forEach((r) => Object.assign(r, this.payload))
        return this.returnRows || this.singleMode ? this.finish(rows) : { data: null, error: null }
      }
      case "upsert": {
        const incoming = Array.isArray(this.payload) ? this.payload : [this.payload]
        const touched: Row[] = []
        for (const r of incoming) {
          const existing = table.find((t) => this.conflictCols.every((c) => t[c] === r[c]))
          if (existing) {
            Object.assign(existing, r)
            touched.push(existing)
          } else {
            const row: Row = { ...(DEFAULTS[this.name]?.() || {}), id: randomUUID(), ...r }
            table.push(row)
            touched.push(row)
          }
        }
        return this.returnRows || this.singleMode ? this.finish(touched) : { data: null, error: null }
      }
      case "delete": {
        const rows = this.matches()
        this.db.removeRows(this.name, rows)
        return this.returnRows ? this.finish(rows) : { data: null, error: null }
      }
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }
}
