'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Placeholder data — in production, fetch from an API route
const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
const data = months.map((month, i) => ({
  month,
  subscriptions: Math.round(800 + i * 350 + Math.random() * 200),
  smartOffers: Math.round(200 + i * 150 + Math.random() * 100),
  aiCredits: Math.round(50 + i * 80 + Math.random() * 60),
}))

export default function AdminRevenueChart() {
  return (
    <div className="mt-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
          <Line type="monotone" dataKey="subscriptions" stroke="#C9A84C" strokeWidth={2} dot={false} name="Subscriptions" />
          <Line type="monotone" dataKey="smartOffers" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Smart Offers" />
          <Line type="monotone" dataKey="aiCredits" stroke="#06B6D4" strokeWidth={2} dot={false} name="AI Credits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
