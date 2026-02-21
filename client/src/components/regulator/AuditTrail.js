import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Timeline, TimelineItem, TimelineContent, TimelineDate, TimelineTitle, TimelineDescription } from '../ui/timeline'
import { Input } from '../ui/input'

export default function AuditTrail() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const auditEvents = [
    {
      id: 'AUD-001',
      caseId: 'EL-2024-0892',
      applicant: 'Ahmed Al-Mahrouqi',
      action: 'Eligibility Approved',
      status: 'approved',
      timestamp: '2024-02-20T14:30:00',
      reviewer: 'Regulator #1',
      notes: 'All eligibility criteria verified and confirmed. Applicant meets all requirements for standard subsidy program.',
      ipAddress: '192.168.1.45',
    },
    {
      id: 'AUD-002',
      caseId: 'EL-2024-0891',
      applicant: 'Salma Al-Balushi',
      action: 'Flagged for Review',
      status: 'flagged',
      timestamp: '2024-02-20T12:15:00',
      reviewer: 'System Auto-Flag',
      notes: 'Income slightly above threshold (620 OMR vs 600 OMR limit). Requires manual review by senior regulator.',
      ipAddress: 'System',
    },
    {
      id: 'AUD-003',
      caseId: 'EL-2024-0890',
      applicant: 'Mohammed Al-Saidi',
      action: 'Eligibility Approved',
      status: 'approved',
      timestamp: '2024-02-20T10:45:00',
      reviewer: 'Regulator #1',
      notes: 'Large family (5 members) with low income (380 OMR). Qualifies for enhanced subsidy tier.',
      ipAddress: '192.168.1.45',
    },
    {
      id: 'AUD-004',
      caseId: 'EL-2024-0889',
      applicant: 'Fatima Al-Hinai',
      action: 'Eligibility Rejected',
      status: 'rejected',
      timestamp: '2024-02-19T16:20:00',
      reviewer: 'Regulator #2',
      notes: 'Income exceeds maximum threshold (750 OMR). Does not qualify for any subsidy program.',
      ipAddress: '192.168.1.52',
    },
    {
      id: 'AUD-005',
      caseId: 'EL-2024-0888',
      applicant: 'Khalid Al-Rashdi',
      action: 'Eligibility Approved',
      status: 'approved',
      timestamp: '2024-02-19T11:00:00',
      reviewer: 'Regulator #3',
      notes: 'Standard eligibility confirmed. All documentation verified.',
      ipAddress: '192.168.1.67',
    },
    {
      id: 'AUD-006',
      caseId: 'EL-2024-0887',
      applicant: 'Noura Al-Ajmi',
      action: 'Documentation Updated',
      status: 'updated',
      timestamp: '2024-02-19T09:30:00',
      reviewer: 'Applicant',
      notes: 'Applicant updated vehicle ownership information. System flagged for re-evaluation.',
      ipAddress: '10.0.0.112',
    },
    {
      id: 'AUD-007',
      caseId: 'EL-2024-0886',
      applicant: 'Yusuf Al-Balushi',
      action: 'Eligibility Approved',
      status: 'approved',
      timestamp: '2024-02-18T15:45:00',
      reviewer: 'Regulator #2',
      notes: 'Application reviewed and approved after additional verification of employment status.',
      ipAddress: '192.168.1.52',
    },
  ]

  const filteredEvents = auditEvents.filter(event => {
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesSearch = !searchQuery ||
      event.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.reviewer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status) => {
    const variants = {
      approved: 'success',
      rejected: 'destructive',
      flagged: 'warning',
      updated: 'secondary',
    }
    const labels = {
      approved: 'Approved',
      rejected: 'Rejected',
      flagged: 'Flagged',
      updated: 'Updated',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = {
    total: auditEvents.length,
    approved: auditEvents.filter(e => e.status === 'approved').length,
    rejected: auditEvents.filter(e => e.status === 'rejected').length,
    flagged: auditEvents.filter(e => e.status === 'flagged').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit Trail</h1>
        <p className="text-slate-600 mt-1">Track all eligibility decisions and regulatory actions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-slate-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-slate-600">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
            <div className="text-sm text-slate-600">Flagged</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search by name, case ID, or reviewer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full h-10 rounded-md border border-input px-3"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
                <option value="updated">Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Actions</label>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Events Timeline</CardTitle>
          <CardDescription>
            Showing {filteredEvents.length} of {stats.total} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No audit events match your filters
            </div>
          ) : (
            <Timeline>
              {filteredEvents.map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineContent>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <TimelineTitle>{event.action}</TimelineTitle>
                        <TimelineDescription>
                          Case {event.caseId} - {event.applicant}
                        </TimelineDescription>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {formatDate(event.timestamp)}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg mb-2">
                      <p className="text-sm">{event.notes}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="font-medium">Reviewer:</span> {event.reviewer}
                      </div>
                      <div>
                        <span className="font-medium">IP:</span> {event.ipAddress}
                      </div>
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>

      {/* Pagination/Load More */}
      <div className="flex justify-center">
        <Button variant="outline">
          Load More Events
        </Button>
      </div>
    </div>
  )
}
