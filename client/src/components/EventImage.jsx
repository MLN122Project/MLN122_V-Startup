import { getEventImage } from '../data/eventImages'

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

export default function EventImage({
  event,
  id,
  size = 'md',
  className = '',
  emoji,
}) {
  const src = getEventImage({ id: event?.id ?? id })
  const fallbackEmoji = emoji ?? event?.emoji ?? '📋'
  const sizeClass = SIZES[size] ?? size
  const alt = event?.label?.replace(/[^\w\sÀ-ỹ]/g, '').trim() ?? 'Sự kiện'

  if (!src) {
    return <span className={`text-2xl leading-none flex-shrink-0 ${className}`}>{fallbackEmoji}</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-xl object-cover border-2 border-white/80 shadow-sm flex-shrink-0 ${sizeClass} ${className}`}
    />
  )
}
