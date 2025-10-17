"use client";

import { useEffect, useRef } from "react";
import { Truck, Shield, Settings, Gift } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Benefits = () => {
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          scale: 0.95,
          duration: 0.7,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      icon: <Truck className="w-7 h-7" />,
      title: "Envíos Seguros",
      description:
        "Ofrecemos envíos seguros con Andreani. El producto siempre viene embalado. Las tarifas varían según la distancia y peso.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Settings className="w-7 h-7" />,
      title: "Funcionalidad",
      description:
        "Nos encargamos de escoger productos que sean útiles y funcionales para el día a día.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Pagos Seguros",
      description:
        "Realiza tu compra con total seguridad utilizando Mercado Pago. También aceptamos transferencias bancarias directas.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Gift className="w-7 h-7" />,
      title: "¡Envío Gratis!",
      description:
        "Envío TOTALMENTE GRATIS en todo Argentina a partir de la 2da unidad. Ahorrá en tus compras.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section
      className="bg-white py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
      id="preguntas-frecuentes"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            ¿Por qué elegir xyntral?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hacemos la vida más fácil con tecnología útil, funcional y confiable
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
