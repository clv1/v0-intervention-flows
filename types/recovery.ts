export interface Alert {
  id: string
  athleteId: string
  athleteName: string
  type: "critical" | "priority" | "advisory"
  title: string
  message: string
  metric: string
  deviation: number
  timestamp: Date
  status: "active" | "in_progress" | "completed" | "snoozed"
  interventions: Intervention[]
  deadline?: Date
  assignedTo?: string
  context?: AlertContext // Add context for travel, etc.
  history?: HistoryEntry[] // Add history tracking
}

export interface AlertContext {
  travelRelated?: boolean
  consecutiveDays?: number
  contributingFactors?: string[]
  previousOccurrences?: number
}

export interface HistoryEntry {
  date: Date
  metric: string
  value: number
  intervention?: string
  outcome?: string
}

export interface Intervention {
  id: string
  type: "sunlight" | "breathwork" | "sleep" | "walk" | "meditation" | "team_activity" | "nutrition" | "recovery"
  title: string
  description: string
  estimatedDuration: number
  priority: number
  status: "pending" | "assigned" | "in_progress" | "completed" | "skipped"
  assignedTo?: string
  completedAt?: Date
  notes?: string
  effectiveness?: number
  athletePromptSent?: boolean
  athleteConfirmed?: boolean
}

export interface Athlete {
  id: string
  name: string
  avatar?: string
  metrics: AthleteMetrics
  riskLevel: "low" | "medium" | "high"
  activeAlerts: number
}

export interface AthleteMetrics {
  hrv: number
  rhr: number
  sleepHours: number
  recoveryScore: number
  stressLevel: number
  lastUpdated: Date
}

export interface Mission {
  id: string
  title: string
  description: string
  alerts: Alert[]
  priority: "critical" | "high" | "medium" | "low"
  deadline: Date
  completionRate: number
  assignedTo: string
}
