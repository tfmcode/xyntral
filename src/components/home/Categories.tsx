"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Smartphone, Tablet, Laptop, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Categories = () => {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
          },
        });
      }

      // Animate cards
      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          scale: 0.9,
          y: 30,
          duration: 0.8,
          delay: i * 0.15,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const categories = [
    {
      title: "Soportes para Celular",
      description: "Auto, escritorio, magnéticos y más",
      icon: <Smartphone className="w-12 h-12" />,
      slug: "soportes-celular",
      gradient: "from-blue-500 to-cyan-500",
      products: "15+ productos",
    },
    {
      title: "Soportes para Tablet",
      description: "Mesa, pared y soluciones flexibles",
      icon: <Tablet className="w-12 h-12" />,
      slug: "soportes-tablet",
      gradient: "from-purple-500 to-pink-500",
      products: "8+ productos",
    },
    {
      title: "Soportes para Notebook",
      description: "Elevadores, cooling pads y bases",
      icon: <Laptop className="w-12 h-12" />,
      slug: "soportes-notebook",
      gradient: "from-orange-500 to-red-500",
      products: "12+ productos",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Explora nuestras categorías
          </h2>
          <p className="text-lg text-gray-600">
            Encuentra el soporte perfecto para cada dispositivo
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, i) => (
            <Link
              key={i}
              href={`/productos?categoria=${category.slug}`}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="text-white mb-16 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {category.products}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
                    Ver productos
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-gray-900 font-semibold px-6 py-3 rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
          >
            Ver todos los productos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
