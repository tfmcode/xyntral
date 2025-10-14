// src/components/Hero.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ShoppingCart, ArrowRight } from "lucide-react";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          subtitleRef.current,
          { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        )
        .from(
          ctaRef.current,
          { opacity: 0, scale: 0.95, duration: 0.6, ease: "back.out(1.7)" },
          "-=0.3"
        )
        .from(
          imageRef.current,
          { opacity: 0, x: 40, duration: 0.9, ease: "power2.out" },
          "-=0.6"
        );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden"
    >
      {/* Elementos decorativos, alejados del banner */}
      <div className="pointer-events-none absolute -top-10 -right-24 w-[28rem] h-[28rem] bg-blue-100/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[34rem] h-[34rem] bg-purple-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-[1.05fr_1.2fr] gap-10 items-center">
          {/* Izquierda */}
          <div className="text-center lg:text-left">
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
            >
              Soporte perfecto para{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                cada dispositivo
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Tecnología útil y funcional para tu día a día. Soportes de calidad
              para celulares, tablets y notebooks que realmente hacen la
              diferencia.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/productos"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                Ver Productos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/sobre-nosotros"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-8 py-4 rounded-full border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300"
              >
                Conocer más
              </Link>
            </div>

            {/* Confianza */}
            <div className="mt-10 pt-10 border-t border-gray-200 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">
                  Envío gratis desde 2da unidad
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="font-medium">Pagos 100% seguros</span>
              </div>
            </div>
          </div>

          {/* Derecha: Banner grande, sin recorte */}
          <div ref={imageRef} className="relative">
            <div className="relative mx-auto max-w-2xl w-full aspect-[16/10] rounded-3xl  ring-1 ring-black/5 shadow-2xl overflow-hidden">
              <Image
                src="/img/banner.png" // ← tu imagen en public/img/banner.png
                alt="xyntral - soportes destacados"
                fill
                priority
                sizes="(min-width:1024px) 48rem, 92vw"
                className="object-contain" // ← no recorta, muestra todo el producto
              />
              {/* Badge flotante */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2">
                <p className="text-sm font-bold leading-none">
                  <span className="text-blue-600">10+</span> Productos
                </p>
              </div>
            </div>
          </div>
          {/* /Derecha */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
