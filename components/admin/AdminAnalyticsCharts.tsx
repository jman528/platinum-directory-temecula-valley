'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']

const revenueData = months.map((month, i) => ({
  month,
  subscriptions: Math.round(800 + i * 350 + Math.random() * 200),
  setupFees: Math.round(100 + i * 200 + Math.random() * 150),
  smartOffers: Math.round(200 + i * 150 + Math.random() * 100),
  aiCredits: Math.round(50 + i * 80 + Math.random() * 60),
}))

const signupData = months.map((month, i) => ({
  month,
  newBusinesses: Math.round(10 + i * 5 + Math.random() * 8),
  newUsers: Math.round(20 + i * 10 + Math.random() * 15),
}))

const tooltipStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#fff',
}

export default function AdminAnalyticsCharts({ type }: { type: 'revenue' | 'signups' }) {
  if (type === 'revenue') {
    return (
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="subscriptions" stroke="#3B82F6" strokeWidth={2} dot={false} name="Subscriptions" />
            <Line type="monotone" dataKey="setupFees" stroke="#D4AF37" strokeWidth={2} dot={false} name="Setup Fees" />
            <Line type="monotone" dataKey="smartOffers" stroke="#22C55E" strokeWidth={2} dot={false} name="Smart Offers" />
            <Line type="monotone" dataKey="aiCredits" stroke="#8B5CF6" strokeWidth={2} dot={false} name="AI Credits" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={signupData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="newBusinesses" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="New Businesses" />
          <Bar dataKey="newUsers" fill="#06B6D4" radius={[4, 4, 0, 0]} name="New Users" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
