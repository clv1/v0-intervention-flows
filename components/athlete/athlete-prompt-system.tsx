"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Sun, Wind, Moon, Brain, Footprints, Users } from "lucide-react"

interface AthletePrompt {
  id: string
  title: string
  description: string
  type: "sunlight" | "breathwork" | "sleep" | "walk" | "meditation" | "team_activity"
  duration: number
  completed: boolean
  sentAt: Date
  priority: "high" | "medium" | "low"
  instructions: string[]
  completionTracking?: {
    startTime?: Date
    endTime?: Date
    effectiveness?: number
  }
}

const getPromptIcon = (type: AthletePrompt["type"]) => {
  switch (type) {
    case "sunlight":
      return <Sun className="h-5 w-5 text-yellow-500" />
    case "breathwork":
      return <Wind className="h-5 w-5 text-blue-500" />
    case "sleep":
      return <Moon className="h-5 w-5 text-purple-500" />
    case "walk":
      return <Footprints className="h-5 w-5 text-green-500" />
    case "meditation":
      return <Brain className="h-5 w-5 text-indigo-500" />
    case "team_activity":
      return <Users className="h-5 w-5 text-orange-500" />
  }
}

export function AthletePromptSystem() {
  const [prompts, setPrompts] = useState<AthletePrompt[]>([
    {
      id: "1",
      title: "10-min AM Sunlight Exposure",
      description: "Your HRV needs a reset after travel. Get direct sunlight to help your circadian rhythm.",
      type: "sunlight",
      duration: 10,
      completed: false,
      sentAt: new Date(),
      priority: "high",
      instructions: [
        "Go outside within 30 minutes of waking",
        "Face the sun (don't look directly at it)",
        "No sunglasses for maximum light exposure",
        "Stay for at least 10 minutes",
      ],
    },
    {
      id: "2",
      title: "20-min Guided Breathwork",
      description: "Activate your recovery system with focused breathing.",
      type: "breathwork",
      duration: 20,
      completed: false,
      sentAt: new Date(Date.now() - 30 * 60 * 1000),
      priority: "high",
      instructions: [
        "Find a quiet, comfortable space",
        "Use the 4-7-8 technique: Inhale 4, Hold 7, Exhale 8",
        "Complete 4 cycles, then rest for 2 minutes",
        "Repeat the full sequence 3 times",
      ],
    },
    {
      id: "3",
      title: "30-min No-Phone Walk",
      description: "Your mental fatigue needs a break. Take a device-free walk.",
      type: "walk",
      duration: 30,
      completed: true,
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: "medium",
      instructions: [
        "Leave all devices at home/office",
        "Walk at a comfortable pace",
        "Focus on your surroundings",
        "Practice mindful observation",
      ],
      completionTracking: {
        startTime: new Date(Date.now() - 90 * 60 * 1000),
        endTime: new Date(Date.now() - 60 * 60 * 1000),
        effectiveness: 8,
      },
    },
  ])

  const [activePrompt, setActivePrompt] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const handleStartPrompt = (promptId: string) => {
    setActivePrompt(promptId)
    setStartTime(new Date())
  }

  const handleCompletePrompt = (promptId: string, effectiveness: number) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.id === promptId
          ? {
              ...p,
              completed: true,
              completionTracking: {
                startTime: startTime || new Date(),
                endTime: new Date(),
                effectiveness,
              },
            }
          : p,
      ),
    )
    setActivePrompt(null)
    setStartTime(null)
  }

  const completedCount = prompts.filter((p) => p.completed).length
  const completionRate = (completedCount / prompts.length) * 100

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">Recovery Prompts</h1>
        <p className="opacity-90">Personalized interventions for optimal recovery</p>

        <div className="mt-4 bg-white/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Today's Progress</span>
            <span className="text-sm font-medium">
              {completedCount}/{prompts.length}
            </span>
          </div>
          <Progress value={completionRate} className="bg-white/30" />
        </div>
      </div>

      {/* Active Prompts */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Interventions</h2>
          <Badge variant="outline">{prompts.filter((p) => !p.completed).length} pending</Badge>
        </div>

        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className={`${
              prompt.completed
                ? "bg-green-50 border-green-200"
                : prompt.priority === "high"
                  ? "border-red-200 bg-red-50"
                  : "border-orange-200"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPromptIcon(prompt.type)}
                  <div>
                    <CardTitle className="text-base">{prompt.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={prompt.priority === "high" ? "destructive" : "secondary"}>{prompt.priority}</Badge>
                  {prompt.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{prompt.duration} min</Badge>
                <span className="text-xs text-muted-foreground">Sent {prompt.sentAt.toLocaleTimeString()}</span>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Instructions:</p>
                <ul className="text-xs space-y-1">
                  {prompt.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              {!prompt.completed && (
                <div className="flex gap-2 pt-2">
                  {activePrompt === prompt.id ? (
                    <div className="flex gap-2 w-full">
                      <Button size="sm" className="flex-1" onClick={() => handleCompletePrompt(prompt.id, 8)}>
                        Mark Complete
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActivePrompt(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full" onClick={() => handleStartPrompt(prompt.id)}>
                      Start Now
                    </Button>
                  )}
                </div>
              )}

              {/* Completion Feedback */}
              {prompt.completed && prompt.completionTracking && (
                <div className="bg-green-100 p-2 rounded text-xs">
                  <p className="font-medium text-green-800">Completed!</p>
                  <p className="text-green-700">
                    Duration:{" "}
                    {Math.round(
                      (prompt.completionTracking.endTime!.getTime() - prompt.completionTracking.startTime!.getTime()) /
                        60000,
                    )}{" "}
                    minutes
                  </p>
                  <p className="text-green-700">Effectiveness: {prompt.completionTracking.effectiveness}/10</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Feedback */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                😴 Tired
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                😊 Good
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                💪 Energized
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
