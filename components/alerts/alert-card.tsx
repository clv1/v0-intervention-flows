"use client"

import type { Alert } from "@/types/recovery"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import { useState } from "react"
import { InterventionModal } from "./intervention-modal"

interface AlertCardProps {
  alert: Alert
  onInterventionComplete: (alertId: string, interventionId: string, notes?: string) => void
  onAssign: (alertId: string, staffId: string) => void
  onSendToAthlete: (alertId: string, interventionId: string) => void
}

export function AlertCard({ alert, onInterventionComplete, onAssign, onSendToAthlete }: AlertCardProps) {
  const [showInterventions, setShowInterventions] = useState(false)

  const getPriorityColor = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-500 text-white"
      case "priority":
        return "bg-orange-500 text-white"
      case "advisory":
        return "bg-yellow-500 text-black"
    }
  }

  const getDeviationText = (deviation: number) => {
    const absDeviation = Math.abs(deviation)
    if (absDeviation > 2.5) return `${absDeviation.toFixed(1)}σ - Severe`
    if (absDeviation > 1.5) return `${absDeviation.toFixed(1)}σ - Moderate`
    return `${absDeviation.toFixed(1)}σ - Mild`
  }

  const canDismiss = alert.interventions.every((i) => i.status === "completed")

  return (
    <>
      <Card
        className={`border-l-4 ${
          alert.type === "critical"
            ? "border-l-red-500"
            : alert.type === "priority"
              ? "border-l-orange-500"
              : "border-l-yellow-500"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(alert.type)}>{alert.type.toUpperCase()}</Badge>
                <Badge variant="outline">{alert.metric}</Badge>
                <span className="text-sm text-muted-foreground">{getDeviationText(alert.deviation)}</span>
              </div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(alert.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{alert.message}</p>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{alert.athleteName}</span>
            {alert.deadline && (
              <Badge variant="outline" className="ml-auto">
                Due: {new Date(alert.deadline).toLocaleDateString()}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Interventions ({alert.interventions.filter((i) => i.status === "completed").length}/
                {alert.interventions.length})
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowInterventions(true)}>
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="grid gap-2">
              {alert.interventions.slice(0, 2).map((intervention) => (
                <div key={intervention.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {intervention.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm">{intervention.title}</span>
                  </div>
                  <Badge variant={intervention.status === "completed" ? "default" : "secondary"}>
                    {intervention.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="default" size="sm" onClick={() => setShowInterventions(true)} disabled={canDismiss}>
              Take Action
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAssign(alert.id, "staff-1")}>
              Assign Staff
            </Button>
            {canDismiss && (
              <Button variant="default" size="sm" className="ml-auto bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <InterventionModal
        alert={alert}
        open={showInterventions}
        onClose={() => setShowInterventions(false)}
        onComplete={onInterventionComplete}
        onSendToAthlete={onSendToAthlete}
      />
    </>
  )
}
