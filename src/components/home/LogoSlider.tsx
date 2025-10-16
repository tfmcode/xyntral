"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Tablet,
  Laptop,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface Product {
  id: number;
  nombre: string;
  slug: string;
  imagen_url: string;
  categoria?: {
    nombre: string;
    slug: string;
  };
}

const LogoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch productos destacados
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/productos?destacados=true&limit=6");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Animación de entrada
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          opacity: 0,
          y: -30,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
          },
        });
      }

      if (containerRef.current) {
        gsap.from(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        });
      }
    });

    return () => ctx.revert();
  }, [loading]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getCategoryIcon = (categorySlug?: string) => {
    if (!categorySlug) return <Smartphone className="w-8 h-8" />;

    if (categorySlug.includes("celular"))
      return <Smartphone className="w-8 h-8" />;
    if (categorySlug.includes("tablet")) return <Tablet className="w-8 h-8" />;
    if (categorySlug.includes("notebook"))
      return <Laptop className="w-8 h-8" />;
    return <Smartphone className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];

  return (
    <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Productos Destacados
          </h2>
          <p className="text-xl text-white/90 drop-shadow">
            Descubrí nuestros soportes más populares
          </p>
        </div>

        {/* Main Slider Container */}
        <div ref={containerRef} className="relative">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-inner">
                <Link href={`/productos/${currentProduct.slug}`}>
                  <div className="relative w-full h-full p-8 flex items-center justify-center group cursor-pointer">
                    <Image
                      src={
                        currentProduct.imagen_url ||
                        "/img/placeholder-product.png"
                      }
                      alt={currentProduct.nombre}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>

                {/* Category Badge */}
                {currentProduct.categoria && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <div className="text-indigo-600">
                      {getCategoryIcon(currentProduct.categoria.slug)}
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {currentProduct.categoria.nombre}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {currentProduct.nombre}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Explorá la calidad y funcionalidad de nuestros productos
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/productos/${currentProduct.slug}`}
                  className="inline-block w-full md:w-auto"
                >
                  <button className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                    Ver Producto
                  </button>
                </Link>

                {/* Navigation Indicators */}
                <div className="flex items-center justify-center md:justify-start gap-2 pt-4">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-8 bg-indigo-600"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Ir al producto ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={prevSlide}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                aria-label="Producto anterior"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="text-center">
                <p className="text-gray-600 font-semibold">
                  {currentIndex + 1} / {products.length}
                </p>
              </div>

              <button
                onClick={nextSlide}
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                aria-label="Producto siguiente"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* View All Products Link */}
          <div className="text-center mt-8">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-white font-semibold text-lg hover:text-white/80 transition-colors"
            >
              Ver todos los productos
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoSlider;
