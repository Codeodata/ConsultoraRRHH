'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface Props {
  active: number
  inactive: number
  byDepartment: { name: string; count: number }[]
}

const STATUS_COLORS = ['#34d399', '#94a3b8']
const BAR_COLOR = '#60a5fa'

export function EmployeeCharts({ active, inactive, byDepartment }: Props) {
  const statusData = [
    { name: 'Activos', value: active },
    { name: 'Inactivos', value: inactive },
  ].filter((d) => d.value > 0)

  const deptData = byDepartment.map((d) => ({ name: d.name || 'Sin área', value: d.count }))

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Donut — estado */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-1">Estado del equipo</h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{active + inactive} empleados en total</p>
        {active + inactive === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-gray-400 dark:text-zinc-500">
            Sin datos
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                  }}
                  formatter={(v, name) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-3">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
                  />
                  {d.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Barras — por área */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-1">Distribución por área</h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">
          {deptData.length} área{deptData.length !== 1 ? 's' : ''} registrada{deptData.length !== 1 ? 's' : ''}
        </p>
        {deptData.length === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-gray-400 dark:text-zinc-500">
            Sin datos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,.04)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                }}
                formatter={(v) => [v, 'Empleados']}
              />
              <Bar dataKey="value" fill={BAR_COLOR} radius={[5, 5, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
