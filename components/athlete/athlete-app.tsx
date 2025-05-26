"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Flame, Target, TrendingUp } from "lucide-react"

interface AthletePrompt {
  id: string
  title: string
  description: string
  type: "breathing" | "movement" | "sleep" | "nutrition"
  duration: number
  completed: boolean
}

export function AthleteApp() {
  const [prompts, setPrompts] = useState<AthletePrompt[]>([
    {
      id: "1",
      title: "Morning Breathing Exercise",
      description: "Complete 10 minutes of box breathing to optimize your HRV",
      type: "breathing",
      duration: 10,
      completed: false,
    },
    {
      id: "2",
      title: "Hydration Check",
      description: "Drink 500ml of water and log your hydration status",
      type: "nutrition",
      duration: 2,
      completed: true,
    },
  ])

  const [streak, setStreak] = useState(7)
  const completionRate = (prompts.filter((p) => p.completed).length / prompts.length) * 100

  const handleComplete = (promptId: string) => {
    setPrompts((prev) => prev.map((p) => (p.id === promptId ? { ...p, completed: true } : p)))
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">Recovery Hub</h1>
        <p className="opacity-90">Your personalized recovery plan</p>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              <p className="text-sm text-muted-foreground">Today's Progress</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Goals</span>
              <span className="text-sm text-muted-foreground">
                {prompts.filter((p) => p.completed).length}/{prompts.length}
              </span>
            </div>
            <Progress value={completionRate} />
          </CardContent>
        </Card>
      </div>

      {/* Recovery Prompts */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Today's Recovery Plan</h2>

        {prompts.map((prompt) => (
          <Card key={prompt.id} className={`${prompt.completed ? "bg-green-50 border-green-200" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium">{prompt.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                </div>
                {prompt.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500 mt-1" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{prompt.duration} min</Badge>
                  <Badge variant="secondary">{prompt.type}</Badge>
                </div>

                {!prompt.completed && (
                  <Button size="sm" onClick={() => handleComplete(prompt.id)}>
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-16 flex-col">
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">View Trends</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col">
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs">Log Sleep</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
