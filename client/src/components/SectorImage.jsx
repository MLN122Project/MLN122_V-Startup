import { getSectorImage } from '../data/sectorImages'

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

export default function SectorImage({
  team,
  teamKey,
  id,
  sectorShort,
  name,
  size = 'md',
  className = '',
  emoji,
}) {
  const src = getSectorImage({
    teamKey: team?.teamKey ?? teamKey,
    id: team?.id ?? id,
    sectorShort: team?.sectorShort ?? sectorShort,
    name,
  })
  const fallbackEmoji = emoji ?? team?.emoji ?? '🏭'
  const sizeClass = SIZES[size] ?? size
  const alt = team?.sectorShort ?? sectorShort ?? name ?? 'Ngành'

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
