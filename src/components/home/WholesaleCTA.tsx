"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Mail, CheckCircle } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WholesaleCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.from(containerRef.current, {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de envío al backend
    console.log("Email registrado:", email);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div
        ref={containerRef}
        className="relative max-w-4xl mx-auto text-center"
      >
        {/* Icon */}
        <div className="inline-flex p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
          <Package className="w-12 h-12 text-white" />
        </div>

        {/* Content */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Compras al por mayor
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Registrá tu correo electrónico para acceder a compras por mayor y nos
          pondremos en contacto 📦🛒
        </p>

        {/* Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Registrarme
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 max-w-xl mx-auto">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <p className="text-white font-semibold">
              ¡Gracias! Nos pondremos en contacto pronto.
            </p>
          </div>
        )}

        {/* Additional info */}
        <p className="text-blue-200 text-sm mt-6">
          * Beneficios exclusivos y precios especiales para revendedores
        </p>
      </div>
    </section>
  );
};

export default WholesaleCTA;
