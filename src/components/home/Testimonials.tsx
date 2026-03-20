"use client";

import { Heart, MessageSquareQuote, Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "Backend Engineer",
    company: "Razorpay",
    avatar: "AM",
    content:
      "Switched from Postman and never looked back. The environment variables and collection sync are exactly what I needed. Plus it loads instantly as a PWA.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Lisa Chang",
    role: "Full Stack Developer",
    company: "Shopify",
    avatar: "LC",
    content:
      "The WebSocket testing is a game-changer. I can debug real-time connections right alongside my REST APIs. Beautiful interface too.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "David Mueller",
    role: "API Platform Lead",
    company: "Contentful",
    avatar: "DM",
    content:
      "Self-hosting was a breeze with Docker. Our team has full control over our API testing environment with zero data leaving our infrastructure.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Nisha Patel",
    role: "Mobile Engineer",
    company: "PhonePe",
    avatar: "NP",
    content:
      "The localhost direct-connect feature is brilliant. I test my local APIs from the hosted PWA without any proxy configuration. Saves so much time.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Tom Wilson",
    role: "DevOps Engineer",
    company: "Vercel",
    avatar: "TW",
    content:
      "Code generation across 20+ languages is incredibly useful. I prototype API integrations in minutes. The OAuth 2.0 flow support is rock solid.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    name: "Yuki Tanaka",
    role: "Software Architect",
    company: "LINE",
    avatar: "YT",
    content:
      "Open source and this polished? The cookie management and response inspector rival paid tools. Our whole engineering org uses it now.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-32 relative overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-8"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-sm font-medium text-pink-500 dark:text-pink-300">
              Loved by Developers
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Trusted by{" "}
            <span className="bg-linear-to-r from-pink-600 via-violet-600 to-indigo-600 dark:from-pink-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              developers worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join the growing community of developers who have made Api Studio
            their daily driver for API development and testing.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl bg-card/50 border border-border p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                {/* Quote Icon */}
                <MessageSquareQuote className="w-8 h-8 text-primary/15 mb-4 group-hover:text-primary/30 transition-colors" />

                {/* Content */}
                <p className="text-foreground/85 mb-6 leading-relaxed text-sm">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Rating */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i?.toString()}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </motion.div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 rounded-xl bg-linear-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-xs shadow-lg`}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
