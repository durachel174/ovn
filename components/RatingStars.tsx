'use client'

type Props = {
  value: number
  onChange?: (val: number) => void
  readonly?: boolean
}

export default function RatingStars({ value, onChange, readonly = false }: Props) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110'}`}
        >
          <span className={star <= value ? 'text-mauve-400' : 'text-stone-200'}>★</span>
        </button>
      ))}
    </div>
  )
}