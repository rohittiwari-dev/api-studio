"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CookieManager from "@/modules/apis/cookies/components/CookieManager";
import EnvironmentSwitcher from "@/modules/workspace/components/EnvironmentSwitcher";
import useRightPanelStore from "../../store/right-panel.store";
import CodeSnippetPanel from "./CodeSnippetPanel";
import GlobalAuthPanel from "./GlobalAuthPanel";
import RequestInfoPanel from "./RequestInfoPanel";

const RightPanel = () => {
  const { activePanel, closePanel } = useRightPanelStore();

  return (
    <>
      {/* Environment Modal - Two panel view with sidebar */}
      <Dialog
        open={activePanel === "environment"}
        onOpenChange={(open) => !open && closePanel()}
      >
        <DialogContent className="max-w-[90vw] min-w-[70vw] w-fit h-[85vh] p-0 flex items-stretch justify-center flex-col gap-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-sm">Manage Environment</DialogTitle>
          </DialogHeader>
          <EnvironmentSwitcher />
        </DialogContent>
      </Dialog>

      {/* Cookie Manager Modal */}
      <Dialog
        open={activePanel === "cookies"}
        onOpenChange={(open) => !open && closePanel()}
      >
        <DialogContent className="max-w-[90vw] min-w-[70vw] w-fit h-[80vh] p-0 flex items-stretch justify-center flex-col gap-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-sm">Manage Cookies</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4">
            <CookieManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Info Sheet (Side Drawer) */}
      <Sheet
        open={activePanel === "request"}
        onOpenChange={(open) => !open && closePanel()}
      >
        <SheetContent side="right" className="w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b bg-muted/30 shrink-0">
            <SheetTitle className="text-sm">Request Info</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <RequestInfoPanel />
          </div>
        </SheetContent>
      </Sheet>

      {/* Code Snippet Modal */}
      <Dialog
        open={activePanel === "code"}
        onOpenChange={(open) => !open && closePanel()}
      >
        <DialogContent className="max-w-[70vw]! min-w-[700px]! w-[1200px]! h-[80vh] p-0 flex flex-col gap-0 outline-none border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl">
          <DialogHeader className="px-6 py-4 border-b border-border/40 shrink-0">
            <DialogTitle className="text-base font-medium">
              Generate Code
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <CodeSnippetPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Auth Sheet (Side Drawer) */}
      <Sheet
        open={activePanel === "auth"}
        onOpenChange={(open) => !open && closePanel()}
      >
        <SheetContent side="right" className="w-[420px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b bg-muted/30 shrink-0">
            <SheetTitle className="text-sm">Global Authentication</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <GlobalAuthPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default RightPanel;
