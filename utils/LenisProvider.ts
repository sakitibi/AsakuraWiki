'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export const LenisProvider = () => {
    useEffect(() => {
        const lenis:Lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            wheelMultiplier: 1,
            touchMultiplier: 1,
            infinite: false,
        })

        const raf = (time: number) => {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return null
}