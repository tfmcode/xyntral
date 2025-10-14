import Hero from "@/components/home/Hero";
import Benefits from "@/components/home/Benefits";
import Categories from "@/components/home/Categories";
import About from "@/components/home/About";
/* import WholesaleCTA from "@/components/home/WholesaleCTA";*/

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Categories />
      <About />
      <Benefits />
      {/*       <WholesaleCTA /> */}
    </main>
  );
}
