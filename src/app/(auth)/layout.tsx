import type React from "react";
import { BackToHomeButton } from "@/components/back-to-home";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-background flex flex-col items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] left-[20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      </div>

      {/* Navigation - Hidden in PWA mode */}
      <BackToHomeButton />

      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
};

export default AuthLayout;
