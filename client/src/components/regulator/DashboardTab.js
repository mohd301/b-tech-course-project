import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export default function DashboardTab() {
  const metrics = [
    { label: 'Total Cases Reviewed', value: 1247, change: '+12%' },
    { label: 'Compliance Rate', value: '94.5%', change: '+2.3%' },
    { label: 'Pending Reviews', value: 23, change: '-5' },
    { label: 'Anomalies Detected', value: 18, change: '+3' },
  ]

  const regulatoryInsights = [
    { area: 'Income Verification', compliance: 98, status: 'success' },
    { area: 'Residency Status', compliance: 95, status: 'success' },
    { area: 'Vehicle Ownership', compliance: 92, status: 'warning' },
    { area: 'Cylinder Eligibility', compliance: 97, status: 'success' },
    { area: 'Family Size', compliance: 91, status: 'warning' },
  ]

  const recentDecisions = [
    { id: 'EL-2024-0892', applicant: 'Ahmed Al-Mahrouqi', decision: 'Approved', date: '2 hours ago' },
    { id: 'EL-2024-0891', applicant: 'Salma Al-Balushi', decision: 'Requires Review', date: '4 hours ago' },
    { id: 'EL-2024-0890', applicant: 'Mohammed Al-Saidi', decision: 'Approved', date: '6 hours ago' },
    { id: 'EL-2024-0889', applicant: 'Fatima Al-Hinai', decision: 'Rejected', date: '8 hours ago' },
    { id: 'EL-2024-0888', applicant: 'Khalid Al-Rashdi', decision: 'Approved', date: '1 day ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600 mt-1">Monitor and analyze eligibility decisions</p>
        </div>
        <Button variant="outline">Refresh Data</Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {metric.change}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regulatory Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Regulatory Insights</CardTitle>
            <CardDescription>Compliance status across eligibility criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regulatoryInsights.map((insight) => (
              <div key={insight.area}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{insight.area}</span>
                  <Badge variant={insight.status}>
                    {insight.compliance}% compliant
                  </Badge>
                </div>
                <Progress value={insight.compliance} max={100} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
            <CardDescription>Latest eligibility determinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDecisions.map((decision) => (
                <div key={decision.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{decision.applicant}</p>
                    <p className="text-sm text-slate-500">{decision.id}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        decision.decision === 'Approved' ? 'success' :
                        decision.decision === 'Rejected' ? 'destructive' : 'warning'
                      }
                    >
                      {decision.decision}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{decision.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Decisions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common regulatory tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="text-2xl mb-2">📊</span>
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="text-2xl mb-2">⚖️</span>
              <span>Compare Cases</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="text-2xl mb-2">🔍</span>
              <span>Audit Trail</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-6">
              <span className="text-2xl mb-2">📥</span>
              <span>Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
