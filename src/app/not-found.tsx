"use client";

import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Background Ambient Effects */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
        <div className="h-160 w-160 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/20 blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 h-120 w-120 rounded-full bg-violet-500/10 blur-[90px]" />
      </div>

      <div className="z-10 flex max-w-2xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-3xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-xl"
        >
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/20 to-transparent p-px" />
          <FileQuestion className="h-16 w-16 text-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="mb-2 bg-linear-to-br from-foreground to-muted-foreground bg-clip-text text-8xl font-bold tracking-tighter text-transparent sm:text-9xl">
            404
          </h1>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or never existed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <button
            onClick={() => router.back()}
            type="button"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "group gap-2 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50",
            })}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
          <Link
            href={"/"}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className:
                "group gap-2 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted/50",
            })}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </motion.div>
      </div>

      {/* Decorative Footer Element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 text-xs text-muted-foreground/50"
      >
        Error Code: 404_NOT_FOUND
      </motion.div>
    </div>
  );
};

export default NotFound;
