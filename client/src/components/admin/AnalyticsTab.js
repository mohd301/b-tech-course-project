import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card.jsx"
import { Button } from "../ui/button.jsx"
import { Skeleton } from "../ui/skeleton.jsx"
import { Download, TrendingUp, PieChart, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import jsPDF from "jspdf"

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const [applicationTrends, setApplicationTrends] = useState([])
  const [eligibilityDistribution, setEligibilityDistribution] = useState([])
  const [userDemographics, setUserDemographics] = useState([])

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(fetchAnalyticsData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      setApplicationTrends(
        months.map((month) => ({
          month,
          applications: Math.floor(Math.random() * 100) + 50,
          approved: Math.floor(Math.random() * 80) + 40,
          rejected: Math.floor(Math.random() * 20) + 5,
        }))
      )

      setEligibilityDistribution([
        { name: "Eligible", value: 65, color: "#22c55e" },
        { name: "Partially Eligible", value: 20, color: "#eab308" },
        { name: "Not Eligible", value: 15, color: "#ef4444" },
      ])

      setUserDemographics([
        { ageGroup: "18-25", count: 15 },
        { ageGroup: "26-35", count: 35 },
        { ageGroup: "36-45", count: 28 },
        { ageGroup: "46-55", count: 15 },
        { ageGroup: "56+", count: 7 },
      ])

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Analytics Report", 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated: ${lastUpdate.toLocaleString()}`, 20, 30)
    doc.text("Total Applications: " + applicationTrends.reduce((a, b) => a + b.applications, 0), 20, 40)
    doc.text("Approved: " + eligibilityDistribution[0].value + "%", 20, 50)
    doc.text("Partially Eligible: " + eligibilityDistribution[1].value + "%", 20, 60)
    doc.text("Not Eligible: " + eligibilityDistribution[2].value + "%", 20, 70)
    doc.save("analytics-report.pdf")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-10 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Application Trends - Line Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>
                  Monthly application volume over time
                </CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Applications"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Approved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Eligibility Distribution - Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Eligibility Distribution</CardTitle>
                <CardDescription>
                  Breakdown of eligibility outcomes
                </CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eligibilityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Demographics - Pie Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>
                  Age distribution of applicants
                </CardDescription>
              </div>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <RechartsPieChart>
                  <Pie
                    data={userDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {userDemographics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 60}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationTrends.reduce((a, b) => a + b.applications, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibilityDistribution[0].value}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Age Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26-35</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
