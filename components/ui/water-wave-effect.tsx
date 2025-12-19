"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface WaterWaveEffectProps {
    isVisible: boolean
    onComplete?: () => void
}

export function WaterWaveEffect({ isVisible, onComplete }: WaterWaveEffectProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isVisible && onComplete) {
            const timer = setTimeout(onComplete, 2000) // 애니메이션 지속 시간
            return () => clearTimeout(timer)
        }
    }, [isVisible, onComplete])

    if (!mounted) return null

    // Portal을 사용하여 body 바로 아래에 렌더링 (전체 화면 덮기 위함)
    return createPortal(
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "-20%" }}
                    exit={{ y: "100%" }}
                    transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        times: [0, 0.5, 1]
                    }}
                    className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center"
                >
                    {/* 물결 모양 SVG 또는 단순 배경 */}
                    <div className="w-full h-[150vh] bg-gradient-to-t from-blue-500/60 to-blue-400/30 backdrop-blur-[1px] relative">
                        <div className="absolute top-0 left-0 w-full -mt-10 h-20 bg-[url('https://raw.githubusercontent.com/netsgo0319/waterlog-v4/main/public/wave.svg')] bg-repeat-x animate-wave opacity-50"></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}
