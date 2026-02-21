import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import jsPDF from 'jspdf'

export default function ComplianceReports() {
  const [reportType, setReportType] = useState('compliance')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isGenerating, setIsGenerating] = useState(false)

  const reportTypes = [
    { id: 'compliance', label: 'Compliance Summary', description: 'Overview of compliance rates across all criteria' },
    { id: 'decisions', label: 'Decision Report', description: 'Detailed report of all eligibility decisions' },
    { id: 'anomalies', label: 'Anomaly Detection', description: 'Report on detected anomalies and discrepancies' },
    { id: 'auditor', label: 'Auditor Activity', description: 'Activity report for regulator auditors' },
  ]

  const generateComplianceReport = () => {
    const pdf = new jsPDF()
    let y = 20

    // Header
    pdf.setFontSize(20)
    pdf.text('Oman Subsidy System - Compliance Report', 20, y)
    y += 15
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y)
    pdf.text(`Report Type: ${reportType}`, 20, y + 7)
    y += 20

    // Summary Statistics
    pdf.setFontSize(14)
    pdf.text('Executive Summary', 20, y)
    y += 10
    pdf.setFontSize(10)
    pdf.text('Total Cases Reviewed: 1,247', 25, y)
    pdf.text('Overall Compliance Rate: 94.5%', 25, y + 7)
    pdf.text('Eligible Cases: 1,178 (94.5%)', 25, y + 14)
    pdf.text('Ineligible Cases: 58 (4.6%)', 25, y + 21)
    pdf.text('Cases Pending Review: 11 (0.9%)', 25, y + 28)
    y += 40

    // Compliance by Criteria
    pdf.setFontSize(14)
    pdf.text('Compliance by Eligibility Criteria', 20, y)
    y += 10
    pdf.setFontSize(10)
    const criteriaData = [
      ['Criteria', 'Compliance Rate', 'Status'],
      ['Income Verification', '98%', 'Excellent'],
      ['Residency Status', '95%', 'Excellent'],
      ['Vehicle Ownership', '92%', 'Good'],
      ['Cylinder Eligibility', '97%', 'Excellent'],
      ['Family Size', '91%', 'Good'],
    ]

    criteriaData.forEach((row, i) => {
      const bgColor = i === 0 ? [200, 200, 200] : [255, 255, 255]
      pdf.setFillColor(...bgColor)
      pdf.rect(20, y, 170, 8, 'F')
      pdf.setFontSize(i === 0 ? 11 : 10)
      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal')
      pdf.text(row[0], 25, y + 5)
      pdf.text(row[1], 100, y + 5)
      pdf.text(row[2], 140, y + 5)
      y += 8
    })

    // Add new page for detailed findings
    pdf.addPage()
    y = 20
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Key Findings and Recommendations', 20, y)
    y += 15
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')

    const findings = [
      '1. Overall system compliance remains high at 94.5%, exceeding target of 90%.',
      '2. Income verification shows excellent performance (98%), indicating robust validation processes.',
      '3. Family size compliance at 91% is slightly lower; recommend review of data quality.',
      '4. Vehicle ownership data quality improved from 89% to 92% in last quarter.',
      '5. Anomaly detection identified 18 cases requiring additional documentation.',
    ]

    findings.forEach(finding => {
      const lines = pdf.splitTextToSize(finding, 170)
      lines.forEach(line => {
        pdf.text(line, 20, y)
        y += 6
      })
      y += 4
    })

    pdf.save(`compliance-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const generateDecisionsReport = () => {
    const pdf = new jsPDF()
    let y = 20

    // Header
    pdf.setFontSize(20)
    pdf.text('Oman Subsidy System - Decision Report', 20, y)
    y += 15
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y)
    pdf.text(`Report Type: Decision Report`, 20, y + 7)
    y += 20

    // Decision Summary Table
    pdf.setFontSize(14)
    pdf.text('Decision Summary', 20, y)
    y += 10
    pdf.setFontSize(10)

    const decisionData = [
      ['Case ID', 'Applicant', 'Decision', 'Date', 'Reviewer'],
      ['EL-2024-0892', 'Ahmed Al-Mahrouqi', 'Eligible', '2024-02-20', 'Regulator #1'],
      ['EL-2024-0891', 'Salma Al-Balushi', 'Review Required', '2024-02-20', 'Regulator #2'],
      ['EL-2024-0890', 'Mohammed Al-Saidi', 'Eligible', '2024-02-19', 'Regulator #1'],
      ['EL-2024-0889', 'Fatima Al-Hinai', 'Ineligible', '2024-02-19', 'Regulator #2'],
      ['EL-2024-0888', 'Khalid Al-Rashdi', 'Eligible', '2024-02-18', 'Regulator #3'],
    ]

    decisionData.forEach((row, i) => {
      const bgColor = i === 0 ? [200, 200, 200] : [255, 255, 255]
      pdf.setFillColor(...bgColor)
      pdf.rect(20, y, 170, 8, 'F')
      pdf.setFontSize(i === 0 ? 9 : 8)
      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal')
      pdf.text(row[0], 22, y + 5)
      pdf.text(row[1], 55, y + 5)
      pdf.text(row[2], 110, y + 5)
      pdf.text(row[3], 145, y + 5)
      pdf.text(row[4], 170, y + 5)
      y += 8
    })

    pdf.save(`decision-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (reportType === 'compliance' || reportType === 'anomalies') {
        generateComplianceReport()
      } else if (reportType === 'decisions' || reportType === 'auditor') {
        generateDecisionsReport()
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const recentReports = [
    { name: 'Compliance Report', date: '2024-02-20', type: 'compliance', size: '2.4 MB' },
    { name: 'Decision Report', date: '2024-02-19', type: 'decisions', size: '1.8 MB' },
    { name: 'Anomaly Detection', date: '2024-02-18', type: 'anomalies', size: '1.2 MB' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Compliance Reports</h1>
        <p className="text-slate-600 mt-1">Generate and export compliance and audit reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>Select report type and configure parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Report Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      reportType === type.id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium mb-1">{type.label}</div>
                    <div className="text-xs text-slate-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Date Range</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full h-10 rounded-md border border-input px-3"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full h-10 rounded-md border border-input px-3"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={() => setDateRange({ start: '', end: '' })}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Download previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.name}
                  className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{report.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{report.date}</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured report templates for common use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
                  📊
                </div>
                <div>
                  <div className="font-medium">Monthly Summary</div>
                  <div className="text-xs text-slate-500">Standard monthly compliance</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg">
                  ✅
                </div>
                <div>
                  <div className="font-medium">Quarterly Audit</div>
                  <div className="text-xs text-slate-500">Comprehensive audit report</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-lg">
                  ⚠️
                </div>
                <div>
                  <div className="font-medium">Anomaly Review</div>
                  <div className="text-xs text-slate-500">Focus on flagged cases</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
