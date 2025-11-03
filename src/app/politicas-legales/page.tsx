import PoliticasLegales from "@/components/Politicas/PoliticasLegales";

export const metadata = {
  title: "Políticas Legales | Xyntral Tech ARG",
  description:
    "Conocé nuestras políticas de privacidad, términos y condiciones, envíos, cambios, devoluciones y reembolsos.",
  keywords: [
    "políticas legales",
    "privacidad",
    "términos y condiciones",
    "envíos",
    "devoluciones",
    "reembolsos",
    "xyntral tech",
  ],
};

export default function PoliticasPage() {
  return (
    <main className="min-h-screen">
      <PoliticasLegales />
    </main>
  );
}
