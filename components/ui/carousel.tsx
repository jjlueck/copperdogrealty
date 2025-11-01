"use client"

import * as React from "react"
import Image from "next/image"

interface CarouselProps {
  images: string[]
  width?: number
  height?: number
}

export function Carousel({ images, width = 300, height = 300 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000) // Change image every 3 seconds
    return () => clearInterval(interval)
  }, [images])

  if (!images || images.length === 0) {
    return <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">No images</div>
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <Image
        src={images[currentIndex]}
        alt="Carousel image"
        width={width}
        height={height}
        className="object-cover w-full h-full"
      />
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`block h-2 w-2 rounded-full ${
              currentIndex === index ? "bg-primary" : "bg-white bg-opacity-50"
            }`}
          ></span>
        ))}
      </div>
    </div>
  )
}
