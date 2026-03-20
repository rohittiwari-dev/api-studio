"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Lock,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAccountsQuery,
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useGenerateBackupCodesMutation,
  useTwoFactorStatusQuery,
  useVerifyTotpMutation,
} from "@/modules/authentication/hooks/use-security-query";

export function TwoFactorSetup() {
  // Enable flow states
  const [showEnableDialog, setShowEnableDialog] = useState(false);
  const [enablePassword, setEnablePassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [step, setStep] = useState<"password" | "setup" | "verify">("password");

  // Disable flow states
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  // Backup codes flow
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[]>(
    [],
  );

  const { data: twoFactorStatus, isLoading: isLoading2FA } =
    useTwoFactorStatusQuery();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccountsQuery();
  const enableMutation = useEnableTwoFactorMutation();
  const verifyMutation = useVerifyTotpMutation();
  const disableMutation = useDisableTwoFactorMutation();
  const generateBackupCodesMutation = useGenerateBackupCodesMutation();

  const twoFactorEnabled = twoFactorStatus?.enabled ?? false;
  const hasPasswordAccount =
    accounts?.some((a) => a.providerId === "credential") ?? false;
  const isLoading = isLoading2FA || isLoadingAccounts;

  const handleStartEnable = () => {
    setShowEnableDialog(true);
    setStep("password");
    setEnablePassword("");
    setTotpURI("");
    setBackupCodes([]);
    setVerifyCode("");
  };

  const handleEnableWithPassword = async () => {
    if (!enablePassword) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const result = await enableMutation.mutateAsync(enablePassword);
      if (result) {
        setTotpURI(result.totpURI);
        setBackupCodes(result.backupCodes || []);
        setStep("setup");
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleVerify2FA = async () => {
    if (verifyCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      await verifyMutation.mutateAsync(verifyCode);
      setShowEnableDialog(false);
      resetEnableState();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error("Please enter your password");
      return;
    }

    try {
      await disableMutation.mutateAsync(disablePassword);
      setShowDisableDialog(false);
      setDisablePassword("");
    } catch {
      // Error handled by mutation
    }
  };

  const resetEnableState = () => {
    setEnablePassword("");
    setTotpURI("");
    setBackupCodes([]);
    setVerifyCode("");
    setStep("password");
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      handleStartEnable();
    } else {
      setShowDisableDialog(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Extract secret from TOTP URI
  const getTotpSecret = (uri: string) => {
    const match = uri.match(/secret=([A-Z2-7]+)/i);
    return match ? match[1] : "";
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Smartphone className="size-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
            <p className="text-xs text-muted-foreground">
              Add an extra layer of security using an authenticator app
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2">
              {twoFactorEnabled && (
                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                  <CheckCircle2 className="size-3 mr-1" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle}
                disabled={enableMutation.isPending || !hasPasswordAccount}
              />
            </div>
          )}
        </div>

        {/* Regenerate Backup Codes Button - Only show when enabled */}
        {twoFactorEnabled && (
          <div className="pl-11">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRegeneratePassword("");
                setShowRegenerateDialog(true);
              }}
            >
              <Lock className="size-3 mr-2" />
              Regenerate Backup Codes
            </Button>
          </div>
        )}

        {/* Warning for OAuth-only accounts */}
        {!isLoading && !hasPasswordAccount && !twoFactorEnabled && (
          <div className="pl-11">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-amber-600 font-medium">
                  Password required for 2FA
                </p>
                <p className="text-xs text-muted-foreground">
                  You signed in with a social account. To enable two-factor
                  authentication, you need to set a password first.
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the{" "}
                  <span className="font-medium text-foreground">
                    Change Password
                  </span>{" "}
                  section above to create a password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enable 2FA Dialog */}
      <Dialog
        open={showEnableDialog}
        onOpenChange={(open) => {
          if (!open) {
            resetEnableState();
          }
          setShowEnableDialog(open);
        }}
      >
        <DialogContent className="max-w-[90vw]! w-fit! max-h-[90%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="size-5 text-emerald-500" />
              {step === "password" && "Enable Two-Factor Authentication"}
              {step === "setup" && "Set Up Authenticator App"}
              {step === "verify" && "Verify Authenticator"}
            </DialogTitle>
            <DialogDescription>
              {step === "password" &&
                "Enter your password to set up two-factor authentication with an authenticator app."}
              {step === "setup" &&
                "Scan the QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)"}
              {step === "verify" &&
                "Enter the 6-digit code from your authenticator app to complete setup."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Step 1: Password */}
            {step === "password" && (
              <div className="space-y-2">
                <Label className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={enablePassword}
                    onChange={(e) => setEnablePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && enablePassword) {
                        handleEnableWithPassword();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Setup - QR Code & Secret */}
            {step === "setup" && totpURI && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        totpURI,
                      )}`}
                      alt="2FA QR Code"
                      width={180}
                      height={180}
                    />
                  </div>
                </div>

                {/* Secret key */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Can&apos;t scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono text-center">
                      {getTotpSecret(totpURI)}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(getTotpSecret(totpURI))}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Backup codes */}
                {backupCodes.length > 0 && (
                  <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-amber-600">
                        ⚠️ Save these backup codes securely:
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => {
                          const content = `2FA Backup Codes\n${"-".repeat(
                            20,
                          )}\n\n${backupCodes.join(
                            "\n",
                          )}\n\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe. Each code can only be used once.`;
                          const blob = new Blob([content], {
                            type: "text/plain",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "2fa-backup-codes.txt";
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Backup codes downloaded");
                        }}
                      >
                        <Download className="size-3" />
                        Download
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {backupCodes.map((code, i) => (
                        <code
                          key={i?.toString()}
                          className="px-2 py-1 bg-background rounded text-xs font-mono text-center"
                        >
                          {code}
                        </code>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Use these if you lose access to your authenticator app
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Verify */}
            {step === "verify" && (
              <div className="space-y-2">
                <Label className="text-sm">Verification Code</Label>
                <Input
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="font-mono text-center text-2xl tracking-[0.5em] h-14"
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && verifyCode.length === 6) {
                      handleVerify2FA();
                    }
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step === "verify") {
                  setStep("setup");
                } else if (step === "setup") {
                  setStep("password");
                  setTotpURI("");
                } else {
                  setShowEnableDialog(false);
                  resetEnableState();
                }
              }}
            >
              {step === "password" ? "Cancel" : "Back"}
            </Button>

            {step === "password" && (
              <Button
                type="button"
                onClick={handleEnableWithPassword}
                disabled={!enablePassword || enableMutation.isPending}
              >
                {enableMutation.isPending && (
                  <Loader2 className="size-4 animate-spin mr-2" />
                )}
                Continue
              </Button>
            )}

            {step === "setup" && (
              <Button type="button" onClick={() => setStep("verify")}>
                I&apos;ve scanned the code
              </Button>
            )}

            {step === "verify" && (
              <Button
                type="button"
                onClick={handleVerify2FA}
                disabled={verifyCode.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending && (
                  <Loader2 className="size-4 animate-spin mr-2" />
                )}
                Verify & Enable
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text- destructive flex items-center gap-2">
              <AlertCircle className="size-5 text-red-500" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will make your account
              less secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Enter Password to Confirm</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDisableDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={!disablePassword || disableMutation.isPending}
            >
              {disableMutation.isPending && (
                <Loader2 className="size-4 animate-spin mr-2" />
              )}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onOpenChange={setShowBackupCodesDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              New backup codes have been generated. Previous codes are now
              invalid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-amber-600">
                  ⚠️ Save these codes securely:
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    const content = `2FA Backup Codes\n${"-".repeat(
                      20,
                    )}\n\n${generatedBackupCodes.join(
                      "\n",
                    )}\n\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe. Each code can only be used once.`;
                    const blob = new Blob([content], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "2fa-backup-codes.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Backup codes downloaded");
                  }}
                >
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {generatedBackupCodes.map((code, i) => (
                  <code
                    key={i?.toString()}
                    className="px-2 py-1 bg-background rounded text-xs font-mono text-center block"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={() => setShowBackupCodesDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Confirm Dialog */}
      <Dialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              Regenerate Backup Codes
            </DialogTitle>
            <DialogDescription>
              This will invalidate your existing backup codes. Enter your
              password to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Enter Password</Label>
              <Input
                type="password"
                value={regeneratePassword}
                onChange={(e) => setRegeneratePassword(e.target.value)}
                placeholder="Your password"
                onKeyDown={async (e) => {
                  if (
                    e.key === "Enter" &&
                    regeneratePassword &&
                    !generateBackupCodesMutation.isPending
                  ) {
                    try {
                      const result =
                        await generateBackupCodesMutation.mutateAsync(
                          regeneratePassword,
                        );
                      if (result?.backupCodes) {
                        setGeneratedBackupCodes(result.backupCodes);
                        setShowRegenerateDialog(false);
                        setShowBackupCodesDialog(true);
                      }
                    } catch {
                      // Error handled by mutation
                    }
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRegenerateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  const result =
                    await generateBackupCodesMutation.mutateAsync(
                      regeneratePassword,
                    );
                  if (result?.backupCodes) {
                    setGeneratedBackupCodes(result.backupCodes);
                    setShowRegenerateDialog(false);
                    setShowBackupCodesDialog(true);
                  }
                } catch {
                  // Error handled by mutation
                }
              }}
              disabled={
                !regeneratePassword || generateBackupCodesMutation.isPending
              }
            >
              {generateBackupCodesMutation.isPending && (
                <Loader2 className="size-4 animate-spin mr-2" />
              )}
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
