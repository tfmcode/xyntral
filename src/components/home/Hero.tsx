"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ShoppingCart, ArrowRight } from "lucide-react";

const Hero = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);

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
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ctaRef.current,
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.3"
        )
        .from(
          imageRef.current,
          {
            opacity: 0,
            x: 50,
            duration: 1,
            ease: "power2.out",
          },
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
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
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

            {/* Trust badges */}
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

          {/* Right Image */}
          <div ref={imageRef} className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Placeholder - reemplazar con imagen real de productos */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <ShoppingCart className="w-24 h-24 mx-auto text-blue-600/50 mb-4" />
                  <p className="text-gray-600 font-medium">
                    Imagen hero principal
                    <br />
                    <span className="text-sm">(productos destacados)</span>
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 rotate-6 hover:rotate-0 transition-transform">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">10+</p>
                  <p className="text-xs text-gray-600 font-medium">Productos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
