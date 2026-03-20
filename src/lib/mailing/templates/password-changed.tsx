import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordChangedEmailProps {
  userName: string;
  userEmail: string;
  changedAt?: string;
  ipAddress?: string;
  deviceInfo?: string;
  appName?: string;
}

export function PasswordChangedEmail({
  userName,
  userEmail,
  changedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }),
  ipAddress,
  deviceInfo,
  appName = "API Studio",
}: PasswordChangedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {appName} password was changed</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Password Changed</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={paragraph}>
              This is a confirmation that the password for your {appName}{" "}
              account ({userEmail}) was successfully changed.
            </Text>

            {/* Activity Details */}
            <Section style={activityBox}>
              <Text style={activityTitle}>🔒 Account Activity Details</Text>
              <Text style={activityItem}>
                <strong>When:</strong> {changedAt}
              </Text>
              {ipAddress && (
                <Text style={activityItem}>
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
              )}
              {deviceInfo && (
                <Text style={activityItem}>
                  <strong>Device:</strong> {deviceInfo}
                </Text>
              )}
            </Section>

            {/* Security Notice */}
            <Section style={warningBox}>
              <Text style={warningTitle}>⚠️ Wasn&apos;t you?</Text>
              <Text style={warningText}>
                If you didn&apos;t make this change, your account may be
                compromised. Please take immediate action:
              </Text>
              <Text style={warningList}>
                1. Reset your password immediately{"\n"}
                2. Review your account activity{"\n"}
                3. Enable two-factor authentication if not already enabled
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button
                type="button"
                style={button}
                href="https://apistudio.dev/sign-in"
              >
                Sign In to Your Account
              </Button>
            </Section>

            <Text style={securityTip}>
              <strong>Security tip:</strong> Never share your password with
              anyone.
              {appName} will never ask for your password via email.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions, please contact our{" "}
              <Link href="https://apistudio.dev/support" style={link}>
                support team
              </Link>
              .
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  marginTop: "30px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
};

const header = {
  padding: "32px 48px 24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  padding: "0",
};

const content = {
  padding: "0 48px",
};

const greeting = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 24px",
};

const activityBox = {
  margin: "24px 0",
  padding: "20px 24px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  border: "1px solid #0ea5e9",
};

const activityTitle = {
  color: "#0369a1",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const activityItem = {
  color: "#0c4a6e",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 4px",
};

const warningBox = {
  margin: "24px 0",
  padding: "20px 24px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const warningTitle = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const warningList = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-line" as const,
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const securityTip = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
  fontStyle: "italic",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const link = {
  color: "#6366f1",
  textDecoration: "underline",
};

export default PasswordChangedEmail;
