import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import LogoSlider from "@/components/home/LogoSlider";
import About from "@/components/home/About";
/* import WholesaleCTA from "@/components/home/WholesaleCTA";*/

export default function HomePage() {
  return (
    <main>
      <Hero />
      <LogoSlider />
      <About />
      <Benefits />
      {/*       <WholesaleCTA /> */}
    </main>
  );
}
