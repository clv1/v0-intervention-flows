"use client"

import { useState } from "react"
import type { Alert, Athlete } from "@/types/recovery"
import { AlertCard } from "@/components/alerts/alert-card"
import { MissionControl } from "@/components/dashboard/mission-control"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, LayoutDashboard, AlertTriangle, TrendingUp, Target } from "lucide-react"
import { Input } from "@/components/ui/input"
import { InterventionAnalytics } from "@/components/dashboard/intervention-analytics"
import { AthletePromptSystem } from "@/components/athlete/athlete-prompt-system"

// Mock data - replace with your API calls
const mockAlerts: Alert[] = [
  {
    id: "1",
    athleteId: "athlete-1",
    athleteName: "Sarah Johnson",
    type: "critical",
    title: "Autonomic Disruption Detected – Sarah Johnson",
    message: "HRV is 2.1 SD below baseline. RHR elevated by +7 bpm. Likely travel-related.",
    metric: "HRV + RHR",
    deviation: -2.1,
    timestamp: new Date(),
    status: "active",
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    context: {
      travelRelated: true,
      contributingFactors: ["Long-haul flight", "Time zone change", "Disrupted sleep schedule"],
      previousOccurrences: 2,
    },
    history: [
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        metric: "HRV",
        value: 45,
        intervention: "Breathing exercise",
        outcome: "Improved by 15%",
      },
      {
        date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        metric: "RHR",
        value: 52,
        intervention: "Early sleep",
        outcome: "Normalized next day",
      },
    ],
    interventions: [
      {
        id: "int-1",
        type: "sunlight",
        title: "10-min AM Sunlight Exposure",
        description: "Get direct sunlight exposure within 30 minutes of waking to reset circadian rhythm",
        estimatedDuration: 10,
        priority: 1,
        status: "pending",
      },
      {
        id: "int-2",
        type: "breathwork",
        title: "20-min Guided Breathwork",
        description: "Box breathing or 4-7-8 technique to activate parasympathetic nervous system",
        estimatedDuration: 20,
        priority: 2,
        status: "pending",
      },
      {
        id: "int-3",
        type: "sleep",
        title: "Early Lights-out with Sleep Mask",
        description: "Bedtime 1 hour earlier than usual with blackout sleep mask and cool room",
        estimatedDuration: 60,
        priority: 3,
        status: "pending",
      },
    ],
  },
  {
    id: "2",
    athleteId: "athlete-2",
    athleteName: "Mike Chen",
    type: "priority",
    title: "Mental Fatigue Detected – Mike Chen",
    message: "Concentration, mood, and motivation are low 3 days in a row.",
    metric: "Cognitive Wellness",
    deviation: -1.8,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "active",
    context: {
      consecutiveDays: 3,
      contributingFactors: ["High training load", "Academic stress", "Poor sleep quality"],
      previousOccurrences: 1,
    },
    history: [
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        metric: "Mood Score",
        value: 4.2,
        intervention: "Meditation",
        outcome: "Slight improvement",
      },
    ],
    interventions: [
      {
        id: "int-4",
        type: "walk",
        title: "30-min No-Phone Walk",
        description: "Outdoor walk without any devices to reduce mental stimulation and promote recovery",
        estimatedDuration: 30,
        priority: 1,
        status: "pending",
      },
      {
        id: "int-5",
        type: "team_activity",
        title: "Team Mental Recovery Day",
        description: "Group breathing session and journaling with team mental performance coach",
        estimatedDuration: 45,
        priority: 2,
        status: "pending",
      },
      {
        id: "int-6",
        type: "meditation",
        title: "Meditation Prompt via App",
        description: "10-minute guided meditation session through athlete app",
        estimatedDuration: 10,
        priority: 3,
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    athleteId: "athlete-3",
    athleteName: "Emma Rodriguez",
    type: "advisory",
    title: "Sleep Quality Decline Pattern",
    message: "Sleep efficiency dropped 12% over past week. Early intervention recommended.",
    metric: "Sleep Efficiency",
    deviation: -1.2,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "active",
    context: {
      consecutiveDays: 5,
      contributingFactors: ["Late evening training", "Screen time before bed", "Room temperature"],
      previousOccurrences: 0,
    },
    interventions: [
      {
        id: "int-7",
        type: "sleep",
        title: "Sleep Hygiene Protocol",
        description: "Implement 3-2-1 rule: No food 3hrs, no liquids 2hrs, no screens 1hr before bed",
        estimatedDuration: 15,
        priority: 1,
        status: "pending",
      },
    ],
  },
]

const mockAthletes: Athlete[] = [
  {
    id: "athlete-1",
    name: "Sarah Johnson",
    metrics: {
      hrv: 42,
      rhr: 58,
      sleepHours: 7.2,
      recoveryScore: 65,
      stressLevel: 7.8,
      lastUpdated: new Date(),
    },
    riskLevel: "high",
    activeAlerts: 2,
  },
  {
    id: "athlete-2",
    name: "Mike Chen",
    metrics: {
      hrv: 55,
      rhr: 52,
      sleepHours: 6.1,
      recoveryScore: 72,
      stressLevel: 6.2,
      lastUpdated: new Date(),
    },
    riskLevel: "medium",
    activeAlerts: 1,
  },
]

export default function RecoveryDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "critical" | "priority" | "advisory">("all")

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || alert.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleInterventionComplete = (alertId: string, interventionId: string, notes?: string) => {
    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          const updatedInterventions = alert.interventions.map((intervention) => {
            if (intervention.id === interventionId) {
              return {
                ...intervention,
                status: "completed" as const,
                completedAt: new Date(),
                notes,
              }
            }
            return intervention
          })

          const allCompleted = updatedInterventions.every((i) => i.status === "completed")
          return {
            ...alert,
            interventions: updatedInterventions,
            status: allCompleted ? ("completed" as const) : alert.status,
          }
        }
        return alert
      }),
    )
  }

  const handleAssign = (alertId: string, staffId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, assignedTo: staffId, status: "in_progress" as const } : alert,
      ),
    )
  }

  const handleSendToAthlete = (alertId: string, interventionId: string) => {
    // In real app, this would send a push notification to athlete
    console.log(`Sending intervention ${interventionId} to athlete for alert ${alertId}`)
  }

  const stats = {
    completionRate: 87,
    avgResponseTime: 12,
    activeInterventions: alerts.filter((a) => a.status === "in_progress").length,
    improvementRate: 94,
  }

  const criticalCount = alerts.filter((a) => a.type === "critical" && a.status === "active").length
  const priorityCount = alerts.filter((a) => a.type === "priority" && a.status === "active").length

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recovery Command Center</h1>
            <p className="text-muted-foreground">Monitor and manage athlete recovery interventions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} Critical
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {priorityCount} Priority
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Mission Control
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Alerts ({alerts.filter((a) => a.status === "active").length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="athlete-view" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Athlete View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <MissionControl alerts={alerts} missions={[]} athletes={mockAthletes} stats={stats} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search athletes or alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterType === "critical" ? "destructive" : "outline"}
                  onClick={() => setFilterType("critical")}
                  size="sm"
                >
                  Critical
                </Button>
                <Button
                  variant={filterType === "priority" ? "secondary" : "outline"}
                  onClick={() => setFilterType("priority")}
                  size="sm"
                >
                  Priority
                </Button>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No alerts found</h3>
                  <p className="text-muted-foreground">All athletes are within normal parameters</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onInterventionComplete={handleInterventionComplete}
                    onAssign={handleAssign}
                    onSendToAthlete={handleSendToAthlete}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <InterventionAnalytics />
          </TabsContent>

          <TabsContent value="athlete-view">
            <AthletePromptSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
