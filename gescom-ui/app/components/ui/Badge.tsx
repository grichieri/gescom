import { PRIORITY_LABELS, ROLE_LABELS, STATUS_LABELS } from "~/data/labels";
import type { CommunityRole, Incidence } from "~/types";

type Tone = "red" | "orange" | "green" | "blue" | "gray";

const tones: Record<Tone, string> = {
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-600",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

const statusTone: Record<Incidence["status"], Tone> = { 1: "red", 2: "orange", 3: "green" };
const priorityTone: Record<Incidence["priority"], Tone> = { 1: "gray", 2: "blue", 3: "red" };

export function StatusBadge({ status }: { status: Incidence["status"] }) {
  return <Badge tone={statusTone[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Incidence["priority"] }) {
  return <Badge tone={priorityTone[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}

const roleTone: Record<CommunityRole, Tone> = {
  superadmin: "red",
  administrator: "green",
  president: "blue",
  caretaker: "orange",
  owner: "gray",
  tenant: "gray",
  none: "gray",
};

export function RoleBadge({ role }: { role: CommunityRole }) {
  return <Badge tone={roleTone[role]}>{ROLE_LABELS[role]}</Badge>;
}
