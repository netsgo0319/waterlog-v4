"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface WaterDropEffectProps {
    isVisible: boolean
    onComplete: () => void
}

export function WaterDropEffect({ isVisible, onComplete }: WaterDropEffectProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isVisible) {
            // 애니메이션 지속 시간 (예: 2초) 후 종료
            const timer = setTimeout(() => {
                onComplete()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onComplete])

    if (!mounted || !isVisible) return null

    return createPortal(
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            {/* 1. 화면 전체를 덮는 투명한 파란색 배경 (페이드 인/아웃) */}
            <div className="absolute inset-0 bg-blue-500/20 animate-fade-in-out" />

            {/* 2. 물방울 애니메이션 컨테이너 */}
            <div className="relative w-full h-full overflow-hidden">
                {/* 중앙에서 떨어지는 물방울 */}
                <div className="drop" />
                <div className="wave" />
            </div>

            <style jsx>{`
        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out forwards;
        }

        .drop {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 100%;
          transform: translate(-50%, -50%);
          animation: drop 2s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite; 
          /* infinite 대신 forwards로 하고 싶지만, 2초 뒤 컴포넌트가 언마운트되므로 infinite여도 상관없음 */
        }

        .wave {
           position: absolute;
           left: 50%;
           top: 50%;
           width: 20px;
           height: 20px;
           background: transparent;
           border: 4px solid #fff;
           border-radius: 100%;
           transform: translate(-50%, -50%) scale(0);
           opacity: 0;
           animation: wave 2s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes drop {
          0% {
            transform: translate(-50%, -1000%) scaleX(0.5); /* 위에서 시작 */
            opacity: 0;
          }
          30% {
             opacity: 1;
             transform: translate(-50%, -50%) scaleX(1); /* 중앙 도달 */
          }
          50% {
             transform: translate(-50%, -50%) scale(0); /* 사라짐 (퍼짐 효과로 전환) */
             opacity: 1;
          }
          100% {
             transform: translate(-50%, -50%) scale(0);
             opacity: 0;
          }
        }

        @keyframes wave {
           0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
           }
           50% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
           }
           100% {
              transform: translate(-50%, -50%) scale(10); /* 파장 퍼짐 */
              opacity: 0;
           }
        }
      `}</style>
        </div>,
        document.body
    )
}
