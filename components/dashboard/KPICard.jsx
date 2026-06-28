const colors = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
  green:  'bg-green-500/10  border-green-500/20  text-green-400',
}

export default function KPICard({ label, value, icon, change, color }) {
  return (
    <div className={`rounded-xl p-5 border ${colors[color] || colors.indigo}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-500">{change}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}