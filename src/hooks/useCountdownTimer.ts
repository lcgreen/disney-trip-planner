import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/store'
import { setCountdown, setMilliseconds, setIsActive } from '@/store/slices/countdownSlice'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

export function useCountdownTimer(targetDate: string, isActive: boolean, showMilliseconds: boolean = false) {
  const dispatch = useAppDispatch()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration to prevent mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Only run countdown timer after hydration to prevent mismatch
    if (!isHydrated) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isActive || !targetDate) {
      // Reset countdown when not active
      dispatch(setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }))
      dispatch(setMilliseconds(0))
      dispatch(setIsActive(false))
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const target = new Date(targetDate)

      // Check if the date is valid
      if (isNaN(target.getTime())) {
        dispatch(setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }))
        dispatch(setMilliseconds(0))
        dispatch(setIsActive(false))
        return
      }

      if (target > now) {
        const days = differenceInDays(target, now)
        const hours = differenceInHours(target, now) % 24
        const minutes = differenceInMinutes(target, now) % 60
        const seconds = differenceInSeconds(target, now) % 60
        const total = Math.floor((target.getTime() - now.getTime()) / 1000)
        const ms = Math.floor((target.getTime() - now.getTime()) % 1000)

        dispatch(setCountdown({ days, hours, minutes, seconds, total }))
        dispatch(setMilliseconds(ms))
      } else {
        // Countdown has reached zero
        dispatch(setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }))
        dispatch(setMilliseconds(0))
        dispatch(setIsActive(false))
      }
    }

    // Update immediately
    updateCountdown()

    // Set up interval
    intervalRef.current = setInterval(updateCountdown, showMilliseconds ? 100 : 1000)

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetDate, isActive, showMilliseconds, dispatch, isHydrated])
}