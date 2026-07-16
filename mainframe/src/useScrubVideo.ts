import { useEffect, useRef } from 'react'

const SENSITIVITY = 0.8

export function useScrubVideo(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const prevXRef = useRef<number | null>(null)
  const targetTimeRef = useRef(0)
  const seekingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const seekTo = (time: number) => {
      targetTimeRef.current = time
      if (!seekingRef.current) {
        seekingRef.current = true
        video.currentTime = time
      }
    }

    const handleSeeked = () => {
      if (video.currentTime !== targetTimeRef.current) {
        video.currentTime = targetTimeRef.current
      } else {
        seekingRef.current = false
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX
        return
      }
      const currentX = e.clientX
      const delta = currentX - prevXRef.current
      prevXRef.current = currentX

      if (!video.duration || Number.isNaN(video.duration)) return

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration
      const base = seekingRef.current ? targetTimeRef.current : video.currentTime
      let targetTime = base + timeOffset
      targetTime = Math.max(0, Math.min(video.duration, targetTime))
      seekTo(targetTime)
    }

    video.addEventListener('seeked', handleSeeked)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      video.removeEventListener('seeked', handleSeeked)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [videoRef])
}
