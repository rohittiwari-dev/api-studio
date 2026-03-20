import CTA from "@/components/home/CTA";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import PWAInstall from "@/components/home/PWAInstall";
import SelfHosting from "@/components/home/SelfHosting";
import WebhookShowcase from "@/components/home/WebhookShowcase";

export default async function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        <Hero />
        <PWAInstall />
        <WebhookShowcase />
        <SelfHosting />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
