import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'

const sampleCases = [
  {
    id: 'EL-2024-0892',
    applicant: 'Ahmed Al-Mahrouqi',
    email: 'ahmed.m@email.com',
    nid: '12345678',
    income: 450,
    familySize: 4,
    vehicleOwnership: 'Yes',
    cylinderCount: 2,
    residencyYears: 15,
    employmentStatus: 'Employed',
    decision: 'Eligible',
    decisionDate: '2024-02-20',
    reviewer: 'Regulator #1',
    notes: 'All criteria met. Standard approval.',
  },
  {
    id: 'EL-2024-0891',
    applicant: 'Salma Al-Balushi',
    email: 'salma.b@email.com',
    nid: '87654321',
    income: 620,
    familySize: 3,
    vehicleOwnership: 'No',
    cylinderCount: 1,
    residencyYears: 8,
    employmentStatus: 'Self-Employed',
    decision: 'Review Required',
    decisionDate: '2024-02-20',
    reviewer: 'Regulator #2',
    notes: 'Income slightly above threshold. Requires manual review.',
  },
  {
    id: 'EL-2024-0890',
    applicant: 'Mohammed Al-Saidi',
    email: 'mohammed.s@email.com',
    nid: '55555555',
    income: 380,
    familySize: 5,
    vehicleOwnership: 'Yes',
    cylinderCount: 3,
    residencyYears: 20,
    employmentStatus: 'Employed',
    decision: 'Eligible',
    decisionDate: '2024-02-19',
    reviewer: 'Regulator #1',
    notes: 'Large family with low income. Qualifies for enhanced subsidy.',
  },
  {
    id: 'EL-2024-0889',
    applicant: 'Fatima Al-Hinai',
    email: 'fatima.h@email.com',
    nid: '99999999',
    income: 750,
    familySize: 2,
    vehicleOwnership: 'Yes',
    cylinderCount: 2,
    residencyYears: 5,
    employmentStatus: 'Employed',
    decision: 'Ineligible',
    decisionDate: '2024-02-19',
    reviewer: 'Regulator #2',
    notes: 'Income exceeds threshold. No subsidy applicable.',
  },
  {
    id: 'EL-2024-0888',
    applicant: 'Khalid Al-Rashdi',
    email: 'khalid.r@email.com',
    nid: '44444444',
    income: 420,
    familySize: 4,
    vehicleOwnership: 'No',
    cylinderCount: 2,
    residencyYears: 12,
    employmentStatus: 'Retired',
    decision: 'Eligible',
    decisionDate: '2024-02-18',
    reviewer: 'Regulator #3',
    notes: 'Standard eligibility confirmed.',
  },
]

export default function CaseComparison() {
  const [selectedCase1, setSelectedCase1] = useState(null)
  const [selectedCase2, setSelectedCase2] = useState(null)
  const [comparisonTab, setComparisonTab] = useState('overview')

  const handleSelectCase = (caseId, position) => {
    const selectedCase = sampleCases.find(c => c.id === caseId)
    if (position === 1) {
      setSelectedCase1(selectedCase)
    } else {
      setSelectedCase2(selectedCase)
    }
  }

  const isDifferent = (field) => {
    if (!selectedCase1 || !selectedCase2) return false
    return selectedCase1[field] !== selectedCase2[field]
  }

  const renderComparisonField = (label, field) => {
    const diff = isDifferent(field)
    return (
      <div className={"flex justify-between items-center py-2 border-b " + (diff ? "bg-yellow-50" : "")}>
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex gap-8">
          <span className={diff ? "text-blue-600 font-semibold" : ""}>
            {selectedCase1?.[field] || '-'}
          </span>
          <span className={diff ? "text-red-600 font-semibold" : ""}>
            {selectedCase2?.[field] || '-'}
          </span>
        </div>
        {diff && (
          <Badge variant="warning" className="ml-2">Different</Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Case Comparison</h1>
        <p className="text-slate-600 mt-1">Compare eligibility cases side-by-side</p>
      </div>

      {!selectedCase1 || !selectedCase2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Cases to Compare</CardTitle>
            <CardDescription>Choose two eligibility cases from the list below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Case 1</label>
                <select
                  className="w-full h-10 rounded-md border border-input px-3"
                  value={selectedCase1?.id || ''}
                  onChange={(e) => handleSelectCase(e.target.value, 1)}
                >
                  <option value="">Select first case...</option>
                  {sampleCases.filter(c => c.id !== selectedCase2?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.applicant}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Case 2</label>
                <select
                  className="w-full h-10 rounded-md border border-input px-3"
                  value={selectedCase2?.id || ''}
                  onChange={(e) => handleSelectCase(e.target.value, 2)}
                >
                  <option value="">Select second case...</option>
                  {sampleCases.filter(c => c.id !== selectedCase1?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.applicant}</option>
                  ))}
                </select>
              </div>
            </div>
            <h3 className="font-semibold mb-3">Available Cases</h3>
            <div className="grid grid-cols-1 gap-3">
              {sampleCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (!selectedCase1) handleSelectCase(caseItem.id, 1)
                    else if (!selectedCase2) handleSelectCase(caseItem.id, 2)
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{caseItem.applicant}</p>
                      <p className="text-sm text-slate-500">{caseItem.id}</p>
                    </div>
                    <Badge variant={caseItem.decision === "Eligible" ? "success" : caseItem.decision === "Ineligible" ? "destructive" : "warning"}>
                      {caseItem.decision}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={comparisonTab} onValueChange={setComparisonTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="eligibility">Eligibility Criteria</TabsTrigger>
                  <TabsTrigger value="decision">Decision Details</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedCase1.applicant}</CardTitle>
                        <CardDescription>{selectedCase1.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Email:</strong> {selectedCase1.email}</p>
                          <p><strong>NID:</strong> {selectedCase1.nid}</p>
                          <p><strong>Status:</strong> {selectedCase1.employmentStatus}</p>
                          <Badge variant={selectedCase1.decision === "Eligible" ? "success" : selectedCase1.decision === "Ineligible" ? "destructive" : "warning"}>
                            {selectedCase1.decision}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedCase2.applicant}</CardTitle>
                        <CardDescription>{selectedCase2.id}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Email:</strong> {selectedCase2.email}</p>
                          <p><strong>NID:</strong> {selectedCase2.nid}</p>
                          <p><strong>Status:</strong> {selectedCase2.employmentStatus}</p>
                          <Badge variant={selectedCase2.decision === "Eligible" ? "success" : selectedCase2.decision === "Ineligible" ? "destructive" : "warning"}>
                            {selectedCase2.decision}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="eligibility" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility Criteria Comparison</CardTitle>
                      <CardDescription>Differences are highlighted in yellow</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between px-4 py-2 border-b bg-slate-100 font-medium">
                        <span>Criteria</span>
                        <span className="w-48 text-center">{selectedCase1.id}</span>
                        <span className="w-48 text-center">{selectedCase2.id}</span>
                        <span className="w-20 text-center">Status</span>
                      </div>
                      {renderComparisonField('Monthly Income (OMR)', 'income')}
                      {renderComparisonField('Family Size', 'familySize')}
                      {renderComparisonField('Vehicle Ownership', 'vehicleOwnership')}
                      {renderComparisonField('Cylinder Count', 'cylinderCount')}
                      {renderComparisonField('Residency Years', 'residencyYears')}
                      {renderComparisonField('Employment Status', 'employmentStatus')}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="decision" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle>Decision Details - Case 1</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div><p className="text-sm text-slate-500">Decision</p><p className="font-medium">{selectedCase1.decision}</p></div>
                        <div><p className="text-sm text-slate-500">Decision Date</p><p className="font-medium">{selectedCase1.decisionDate}</p></div>
                        <div><p className="text-sm text-slate-500">Reviewer</p><p className="font-medium">{selectedCase1.reviewer}</p></div>
                        <div><p className="text-sm text-slate-500">Notes</p><p className="font-medium">{selectedCase1.notes}</p></div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle>Decision Details - Case 2</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div><p className="text-sm text-slate-500">Decision</p><p className="font-medium">{selectedCase2.decision}</p></div>
                        <div><p className="text-sm text-slate-500">Decision Date</p><p className="font-medium">{selectedCase2.decisionDate}</p></div>
                        <div><p className="text-sm text-slate-500">Reviewer</p><p className="font-medium">{selectedCase2.reviewer}</p></div>
                        <div><p className="text-sm text-slate-500">Notes</p><p className="font-medium">{selectedCase2.notes}</p></div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setSelectedCase1(null)}>Clear Comparison</Button>
            <Button variant="outline" onClick={() => window.print()}>Print Report</Button>
          </div>
        </div>
      )}
    </div>
  )
}
