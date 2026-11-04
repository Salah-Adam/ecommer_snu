"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:size-20",
                i === active ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-2xl border bg-white"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {images[active] && (
          <Image
            src={images[active]}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8 transition-transform duration-200"
            style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        )}
      </div>
    </div>
  );
}
