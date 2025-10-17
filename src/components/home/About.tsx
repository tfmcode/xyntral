"use client";

import { useEffect, useRef } from "react";
import { Target, Award, Users } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.from(contentRef.current, {
          opacity: 0,
          x: -50,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
          },
        });
      }

      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: i * 0.2,
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

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Nuestra Misión",
      text: "Hacer la vida más fácil ofreciendo tecnología útil, funcional y confiable.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Calidad",
      text: "Cumplimos con los más altos estándares en cada producto que seleccionamos.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Compromiso",
      text: "Ser una herramienta práctica en tu rutina diaria.",
    },
  ];

  return (
    <section
      id="sobre-nosotros"
      className="bg-white py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div ref={contentRef}>
            <p className="text-blue-600 font-semibold uppercase tracking-wide mb-2">
              Sobre Nosotros
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Tecnología que acompaña tu día a día
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              xyntral nació con un propósito claro: hacer la vida más fácil.
              Cada producto que elegimos está pensado para brindar soluciones
              reales a necesidades cotidianas.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nuestra misión es ofrecer tecnología útil, funcional y confiable,
              diseñada para acompañarte en el día a día. Queremos ser una
              herramienta práctica en tu rutina y cumplir con los más altos
              estándares de calidad.
            </p>
          </div>

          {/* Right Values */}
          <div className="space-y-6">
            {values.map((value, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                className="group flex items-start gap-4 bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
