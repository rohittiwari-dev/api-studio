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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn?: string;
  appName?: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  expiresIn = "1 hour",
  appName = "API Studio",
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Reset Your Password</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={paragraph}>
              We received a request to reset your password for your {appName}{" "}
              account. Click the button below to create a new password:
            </Text>

            <Section style={buttonSection}>
              <Button type="button" style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            {/* Security Notice */}
            <Section style={securityBox}>
              <Text style={securityTitle}>⚠️ Security Notice</Text>
              <Text style={securityText}>
                This link will expire in <strong>{expiresIn}</strong>. If you
                didn&apos;t request a password reset, please ignore this email
                or contact support if you have concerns.
              </Text>
            </Section>

            <Text style={paragraph}>
              For your security, never share this link with anyone. Our team
              will never ask for your password.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>
            <Text style={linkText}>
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
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
  margin: "0 0 16px",
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

const securityBox = {
  margin: "24px 0",
  padding: "20px 24px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  border: "1px solid #f59e0b",
};

const securityTitle = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const securityText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
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

const linkText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 16px",
  textAlign: "center" as const,
  wordBreak: "break-all" as const,
};

const link = {
  color: "#6366f1",
  textDecoration: "underline",
};

export default PasswordResetEmail;
