'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'

interface ServiceRatingProps {
  serviceId: string
  initialRating: number | null
  initialComment: string | null
}

export function ServiceRating({ serviceId, initialRating, initialComment }: ServiceRatingProps) {
  const [rating, setRating] = useState(initialRating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState(initialComment ?? '')
  const [showComment, setShowComment] = useState(false)
  const [saved, setSaved] = useState(!!initialRating)
  const [isPending, startTransition] = useTransition()

  function submitRating(value: number, commentText?: string) {
    const finalComment = commentText ?? comment
    setRating(value)
    startTransition(async () => {
      await fetch(`/api/services/${serviceId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value, ratingComment: finalComment || null }),
      })
      setSaved(true)
      setShowComment(false)
    })
  }

  const display = hovered || rating

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => {
                setRating(i)
                setShowComment(true)
              }}
              disabled={isPending}
              aria-label={`Calificar ${i} estrellas`}
              className="focus:outline-none disabled:opacity-50"
            >
              <Star
                size={20}
                className={
                  i <= display
                    ? 'text-amber-400 fill-amber-400 transition-colors'
                    : 'text-gray-300 dark:text-zinc-600 fill-gray-300 dark:fill-zinc-600 transition-colors'
                }
              />
            </button>
          ))}
        </div>
        {saved && rating > 0 && (
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {rating}/5
            {initialComment && !showComment && (
              <button
                onClick={() => setShowComment(true)}
                className="ml-2 text-xs text-brand-500 hover:underline"
              >
                editar comentario
              </button>
            )}
          </span>
        )}
        {!saved && !showComment && (
          <span className="text-sm text-gray-400 dark:text-zinc-500">
            Calificá este servicio
          </span>
        )}
      </div>

      {showComment && rating > 0 && (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Dejá un comentario opcional..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => submitRating(rating, comment)}
              disabled={isPending}
              className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-1.5 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Guardando...' : 'Guardar calificación'}
            </button>
            <button
              onClick={() => { setShowComment(false); setRating(initialRating ?? 0) }}
              disabled={isPending}
              className="text-sm text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {saved && initialComment && !showComment && (
        <p className="text-sm text-gray-500 dark:text-zinc-400 italic">"{initialComment}"</p>
      )}
    </div>
  )
}
