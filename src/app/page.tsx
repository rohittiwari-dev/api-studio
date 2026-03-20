import AiShowcase from "@/components/home/AiShowcase";
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
        {/* 1. Hero — first impression + primary CTA */}
        <Hero />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />

        {/* 2. Features — what makes Api Studio stand out */}
        <Features />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* 3. AI Copilot — Gemini-powered assistant */}
        <AiShowcase />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* 4. Webhook Showcase — live demo of real-time capabilities */}
        <WebhookShowcase />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* 4. PWA Install — offline + local dev story */}
        <PWAInstall />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />

        {/* 5. Self Hosting — ownership + control narrative */}
        <SelfHosting />

        {/* Gradient divider */}
        <div className="h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* 6. CTA — final conversion push */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
