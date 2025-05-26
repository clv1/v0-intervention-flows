"use client"

import type { Alert } from "@/types/recovery"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Calendar, Activity } from "lucide-react"

interface HistoryModalProps {
  alert: Alert
  open: boolean
  onClose: () => void
}

export function HistoryModal({ alert, open, onClose }: HistoryModalProps) {
  const getOutcomeColor = (outcome: string) => {
    if (outcome.toLowerCase().includes("improved") || outcome.toLowerCase().includes("normalized")) {
      return "text-green-600"
    }
    if (outcome.toLowerCase().includes("slight")) {
      return "text-yellow-600"
    }
    return "text-gray-600"
  }

  const getTrendIcon = (outcome: string) => {
    if (outcome.toLowerCase().includes("improved") || outcome.toLowerCase().includes("normalized")) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recovery History - {alert.athleteName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Alert Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Situation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Metric</p>
                  <p className="text-lg">{alert.metric}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Deviation</p>
                  <p className="text-lg">{Math.abs(alert.deviation).toFixed(1)}σ below baseline</p>
                </div>
              </div>

              {alert.context && (
                <div className="space-y-2">
                  {alert.context.travelRelated && <Badge variant="outline">Travel-Related</Badge>}
                  {alert.context.consecutiveDays && (
                    <Badge variant="outline">{alert.context.consecutiveDays} consecutive days</Badge>
                  )}
                  {alert.context.previousOccurrences !== undefined && (
                    <Badge variant="outline">{alert.context.previousOccurrences} previous occurrences</Badge>
                  )}
                </div>
              )}

              {alert.context?.contributingFactors && (
                <div>
                  <p className="text-sm font-medium mb-2">Contributing Factors</p>
                  <div className="flex flex-wrap gap-1">
                    {alert.context.contributingFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historical Data */}
          {alert.history && alert.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previous Interventions & Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alert.history.map((entry, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {entry.date.toLocaleDateString()}
                        </div>
                        <div>
                          <p className="font-medium">{entry.metric}</p>
                          <p className="text-sm text-muted-foreground">Value: {entry.value}</p>
                          {entry.intervention && (
                            <p className="text-sm">
                              <span className="font-medium">Intervention:</span> {entry.intervention}
                            </p>
                          )}
                        </div>
                      </div>
                      {entry.outcome && (
                        <div className="flex items-center gap-2">
                          {getTrendIcon(entry.outcome)}
                          <span className={`text-sm ${getOutcomeColor(entry.outcome)}`}>{entry.outcome}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Intervention Success Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Works Best for {alert.athleteName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Most Effective</p>
                  <p className="text-sm text-green-700">
                    Morning sunlight + breathwork combination shows 85% improvement rate
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Quick Response</p>
                  <p className="text-sm text-blue-700">Breathing exercises typically show results within 2-4 hours</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Prevention</p>
                  <p className="text-sm text-yellow-700">Early sleep interventions prevent 70% of next-day issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
