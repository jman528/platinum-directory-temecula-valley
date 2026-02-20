'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const viewsData = days.map((day) => ({
  day,
  views: Math.round(Math.random() * 20 + 5),
  clicks: Math.round(Math.random() * 8 + 1),
}))

const sourcesData = [
  { source: 'Direct', leads: 12 },
  { source: 'Search', leads: 8 },
  { source: 'Referral', leads: 5 },
  { source: 'Social', leads: 3 },
  { source: 'Email', leads: 2 },
]

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#fff',
}

export default function DashboardAnalyticsCharts({ type }: { type: 'views' | 'sources' }) {
  if (type === 'views') {
    return (
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              interval={6}
            />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={false} name="Views" />
            <Line type="monotone" dataKey="clicks" stroke="#C9A84C" strokeWidth={2} dot={false} name="Clicks" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sourcesData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <YAxis type="category" dataKey="source" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} width={60} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="leads" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Leads" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
