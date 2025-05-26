"use client"

import type { Alert, Intervention } from "@/types/recovery"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Clock, Send, Play } from "lucide-react"
import { useState } from "react"
import { HistoryModal } from "./history-modal"

interface InterventionModalProps {
  alert: Alert
  open: boolean
  onClose: () => void
  onComplete: (alertId: string, interventionId: string, notes?: string) => void
  onSendToAthlete: (alertId: string, interventionId: string) => void
}

export function InterventionModal({ alert, open, onClose, onComplete, onSendToAthlete }: InterventionModalProps) {
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [showHistory, setShowHistory] = useState(false)

  const handleComplete = (interventionId: string) => {
    onComplete(alert.id, interventionId, notes)
    setNotes("")
    setSelectedIntervention(null)
  }

  const getInterventionIcon = (intervention: Intervention) => {
    switch (intervention.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Play className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-orange-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Recovery Intervention Protocol
              <Badge variant="outline">{alert.athleteName}</Badge>
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
              View History
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Alert Details</h3>
            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
            <div className="flex gap-2">
              <Badge>{alert.metric}</Badge>
              <Badge variant="outline">{Math.abs(alert.deviation).toFixed(1)}σ deviation</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Required Interventions</h3>
            {alert.interventions.map((intervention) => (
              <div
                key={intervention.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedIntervention === intervention.id ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setSelectedIntervention(intervention.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInterventionIcon(intervention)}
                    <h4 className="font-medium">{intervention.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{intervention.estimatedDuration}min</Badge>
                    <Badge variant={intervention.status === "completed" ? "default" : "secondary"}>
                      {intervention.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{intervention.description}</p>

                {intervention.status !== "completed" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComplete(intervention.id)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSendToAthlete(alert.id, intervention.id)
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send to Athlete
                    </Button>
                  </div>
                )}

                {intervention.status === "completed" && intervention.notes && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                    <strong>Notes:</strong> {intervention.notes}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedIntervention && (
            <div className="space-y-3">
              <h4 className="font-medium">Intervention Notes</h4>
              <Textarea
                placeholder="Add notes about the intervention execution, athlete response, or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
        <HistoryModal alert={alert} open={showHistory} onClose={() => setShowHistory(false)} />
      </DialogContent>
    </Dialog>
  )
}
