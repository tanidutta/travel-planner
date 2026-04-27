'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

const images = [
  { src: '/banner_image/Beach.png',    alt: 'Beach' },
  { src: '/banner_image/Desert.png',   alt: 'Desert' },
  { src: '/banner_image/Forest.png',   alt: 'Forest' },
  { src: '/banner_image/Mountain.png', alt: 'Mountain' },
  { src: '/banner_image/Paris.png',    alt: 'Paris' },
  { src: '/banner_image/Snow.png',     alt: 'Snow' },
]

export default function Banner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl">
      <AnimatePresence>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <Image
            src={images[current].src}
            alt={images[current].alt}
            fill
            className="object-cover"
            priority={current === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />

      <div className="absolute bottom-5 left-6 z-10">
        <h2 className="text-white text-xl font-semibold drop-shadow-md">
          Your next adventure awaits
        </h2>
        <p className="text-white/80 text-sm mt-1 drop-shadow-md">
          Plan your perfect trip today
        </p>
      </div>

      <div className="absolute bottom-5 right-6 flex items-center gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: idx === current ? '20px' : '8px',
              height: '8px',
              background: idx === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
