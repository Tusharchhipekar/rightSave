import Header from "@/features/landing/Header";
import Hero from "@/features/landing/Hero";
import HowItWorks from "@/features/landing/HowItWorks";
import Comparison from "@/features/landing/Comparison";
import CtaBanner from "@/features/landing/CtaBanner";
import Footer from "@/features/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface">
        <div className="flex flex-col w-full">
          <Hero />
          <HowItWorks />
          <Comparison />
          <CtaBanner />
        </div>
      </main>
      <Footer />
    </>
  );
}
