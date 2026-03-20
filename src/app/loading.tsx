"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen overflow-hidden bg-background relative">
      {/* Shared Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 dark:opacity-20">
          <motion.div
            className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo Container with Glass Effect */}
        <div className="relative w-20 h-20">
          {/* Rotating Gradient Ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600/0 to-indigo-600 p-[2px]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Inner Mask to create the border look */}
            <div className="w-full h-full rounded-full bg-background/80 backdrop-blur-xl" />
          </motion.div>

          {/* Static/Breathing Logo Center */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="relative w-8 h-8 !rounded-full"
            >
              <Image
                src="/logo.png"
                alt="Api Studio"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Subtle Glow behind */}
          <motion.div
            className="absolute inset-0 !rounded-full bg-violet-500/20 blur-2xl -z-10"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading Bar */}
        <div className="flex flex-col items-center gap-3">
          <motion.h2
            className="text-lg font-medium bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Api Studio
          </motion.h2>

          <div className="relative w-32 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full w-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
