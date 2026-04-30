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
  services: { pending: number; inProgress: number; completed: number }
  tasks: { pending: number; inProgress: number; completed: number }
}

const SERVICE_DATA_COLORS = ['#facc15', '#60a5fa', '#34d399']
const TASK_COLORS = ['#facc15', '#60a5fa', '#34d399']

export function DashboardCharts({ services, tasks }: Props) {
  const serviceData = [
    { name: 'Pendientes', value: services.pending },
    { name: 'En proceso', value: services.inProgress },
    { name: 'Finalizados', value: services.completed },
  ].filter((d) => d.value > 0)

  const taskData = [
    { name: 'Pendientes', value: tasks.pending, fill: TASK_COLORS[0] },
    { name: 'En proceso', value: tasks.inProgress, fill: TASK_COLORS[1] },
    { name: 'Completadas', value: tasks.completed, fill: TASK_COLORS[2] },
  ]

  const totalServices = services.pending + services.inProgress + services.completed

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Donut — servicios */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-1">Estado de servicios</h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">{totalServices} servicios en total</p>
        {totalServices === 0 ? (
          <div className="flex items-center justify-center h-[180px] text-sm text-gray-400 dark:text-zinc-500">
            Sin datos
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {serviceData.map((_, i) => (
                    <Cell key={i} fill={SERVICE_DATA_COLORS[i % SERVICE_DATA_COLORS.length]} />
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
              {serviceData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SERVICE_DATA_COLORS[i % SERVICE_DATA_COLORS.length] }}
                  />
                  {d.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Barras — tareas */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm dark:shadow-none">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-50 mb-1">Distribución de tareas</h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">
          {tasks.pending + tasks.inProgress + tasks.completed} tareas en total
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={taskData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
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
              formatter={(v) => [v, 'Tareas']}
            />
            <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={56}>
              {taskData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
