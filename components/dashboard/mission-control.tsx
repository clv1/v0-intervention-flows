"use client"

import type { Alert, Mission, Athlete } from "@/types/recovery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from "lucide-react"

interface MissionControlProps {
  alerts: Alert[]
  missions: Mission[]
  athletes: Athlete[]
  stats: {
    completionRate: number
    avgResponseTime: number
    activeInterventions: number
    improvementRate: number
  }
}

export function MissionControl({ alerts, missions, athletes, stats }: MissionControlProps) {
  const criticalAlerts = alerts.filter((a) => a.type === "critical" && a.status === "active")
  const priorityAlerts = alerts.filter((a) => a.type === "priority" && a.status === "active")
  const completedToday = alerts.filter(
    (a) => a.status === "completed" && new Date(a.timestamp).toDateString() === new Date().toDateString(),
  ).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}min</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Interventions</p>
                <p className="text-2xl font-bold">{stats.activeInterventions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improvement Rate</p>
                <p className="text-2xl font-bold">{stats.improvementRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Missions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Missions ({criticalAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No critical alerts - great work!</p>
          ) : (
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{alert.athleteName}</p>
                      <p className="text-sm text-muted-foreground">{alert.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {alert.interventions.filter((i) => i.status !== "completed").length} pending
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Priority Missions ({priorityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">{alert.athleteName}</span>
                  </div>
                  <Badge variant="outline">{alert.metric}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Athlete Risk Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {athletes.slice(0, 5).map((athlete) => (
                <div key={athlete.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        athlete.riskLevel === "high"
                          ? "bg-red-500"
                          : athlete.riskLevel === "medium"
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <span className="text-sm">{athlete.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {athlete.activeAlerts > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {athlete.activeAlerts} alerts
                      </Badge>
                    )}
                    <Badge
                      variant={
                        athlete.riskLevel === "high"
                          ? "destructive"
                          : athlete.riskLevel === "medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {athlete.riskLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Interventions Completed</span>
              <span className="font-medium">
                {completedToday}/{alerts.length}
              </span>
            </div>
            <Progress value={(completedToday / alerts.length) * 100} />

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedToday}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter((a) => a.status === "in_progress").length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{alerts.filter((a) => a.status === "active").length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
