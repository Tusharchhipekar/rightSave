import Header from "@/features/landing/Header";
import Pricing from "@/features/landing/Pricing";
import Footer from "@/features/landing/Footer";

export const metadata = { title: "Pricing | RightSave AI" };

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="w-full pt-16 bg-surface">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}