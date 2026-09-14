'use client'

import { useEffect, useRef, useState } from 'react'

const PROGRESS_SAVE_INTERVAL_MS = 10_000
// کمی زودتر از انقضای واقعی URL موقت (۳۰۰ ثانیه) رفرش می‌شود تا وسط پخش قطع نشود
const SIGNED_URL_REFRESH_MS = 4 * 60_000

export function LessonPlayer({ lessonId, initialPositionSeconds }: { lessonId: string; initialPositionSeconds: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState('')
  const lastSavedRef = useRef(0)
  const restoredRef = useRef(false)

  useEffect(() => {
    let active = true

    async function fetchSignedUrl() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/stream-url`)
        const body = await response.json()
        if (!response.ok || !body.ok) throw new Error(body.message || 'دریافت ویدئو ناموفق بود')
        if (!active) return
        setSrc(body.url)
        setError('')
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری ویدئو')
      }
    }

    fetchSignedUrl()
    const interval = setInterval(fetchSignedUrl, SIGNED_URL_REFRESH_MS)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [lessonId])

  function saveProgress(positionSeconds: number, completed: boolean) {
    navigator.sendBeacon?.(
      '/api/lesson-progress',
      new Blob([JSON.stringify({ lessonId, positionSeconds, completed })], { type: 'application/json' }),
    ) ??
      fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, positionSeconds, completed }),
        keepalive: true,
      })
  }

  function handleLoadedMetadata() {
    const video = videoRef.current
    if (!video || restoredRef.current) return
    if (initialPositionSeconds > 1 && initialPositionSeconds < video.duration - 2) {
      video.currentTime = initialPositionSeconds
    }
    restoredRef.current = true
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    const now = Date.now()
    if (now - lastSavedRef.current > PROGRESS_SAVE_INTERVAL_MS) {
      lastSavedRef.current = now
      const completed = video.duration > 0 && video.currentTime / video.duration > 0.95
      saveProgress(Math.floor(video.currentTime), completed)
    }
  }

  function handleEnded() {
    const video = videoRef.current
    if (!video) return
    saveProgress(Math.floor(video.duration || video.currentTime), true)
  }

  if (error) {
    return <div className="rounded-[var(--radius-base)] bg-red-50 p-6 text-center text-red-700">{error}</div>
  }

  if (!src) {
    return <div className="flex aspect-video items-center justify-center rounded-[var(--radius-base)] bg-[var(--color-accent-soft)]">در حال بارگذاری ویدئو...</div>
  }

  return (
    <video
      ref={videoRef}
      controls
      controlsList="nodownload"
      className="w-full rounded-[var(--radius-base)] bg-black"
      src={src}
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  )
}
