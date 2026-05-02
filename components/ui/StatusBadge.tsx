import { ProjectStatus, STATUS_COLORS } from '@/lib/types'

interface Props {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const base = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${base} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
      {status}
    </span>
  )
}
