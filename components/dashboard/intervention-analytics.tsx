"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, CheckCircle, Target, Brain, Sun } from "lucide-react"

interface InterventionStats {
  type: string
  icon: React.ReactNode
  totalUsed: number
  successRate: number
  avgResponseTime: number
  mostEffectiveFor: string[]
  recentTrend: "up" | "down" | "stable"
}

export function InterventionAnalytics() {
  const interventionStats: InterventionStats[] = [
    {
      type: "Sunlight Exposure",
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      totalUsed: 24,
      successRate: 87,
      avgResponseTime: 45,
      mostEffectiveFor: ["HRV Recovery", "Circadian Reset", "Post-Travel"],
      recentTrend: "up",
    },
    {
      type: "Breathwork",
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      totalUsed: 31,
      successRate: 92,
      avgResponseTime: 15,
      mostEffectiveFor: ["Acute Stress", "Pre-Competition", "Sleep Prep"],
      recentTrend: "up",
    },
    {
      type: "No-Phone Walks",
      icon: <Target className="h-5 w-5 text-green-500" />,
      totalUsed: 18,
      successRate: 78,
      avgResponseTime: 120,
      mostEffectiveFor: ["Mental Fatigue", "Cognitive Recovery", "Mood"],
      recentTrend: "stable",
    },
  ]

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Intervention Analytics</h2>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interventions</p>
                <p className="text-2xl font-bold">73</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">52min</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Athlete Compliance</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {interventionStats.map((stat) => (
          <Card key={stat.type}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <CardTitle className="text-lg">{stat.type}</CardTitle>
                </div>
                {getTrendIcon(stat.recentTrend)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-xl font-bold">{stat.totalUsed}x</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold">{stat.successRate}%</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Effectiveness</span>
                  <span className="text-sm font-medium">{stat.successRate}%</span>
                </div>
                <Progress value={stat.successRate} />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Most Effective For:</p>
                <div className="flex flex-wrap gap-1">
                  {stat.mostEffectiveFor.map((use, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">Avg response time: {stat.avgResponseTime} minutes</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">High Success Pattern</p>
              <p className="text-sm text-green-700">
                Morning sunlight + breathwork combination shows 94% success rate for post-travel recovery
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Quick Response</p>
              <p className="text-sm text-blue-700">
                Athletes who complete interventions within 30 minutes show 23% better outcomes
              </p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Compliance Boost</p>
              <p className="text-sm text-purple-700">
                Detailed instructions increase completion rates by 31% compared to simple prompts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
