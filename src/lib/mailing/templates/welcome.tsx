import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  loginUrl?: string;
  appName?: string;
}

export function WelcomeEmail({
  userName,
  userEmail,
  loginUrl = "https://apistudio.dev/sign-in",
  appName = "API Studio",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {appName} - Your all-in-one API development platform
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>🚀 {appName}</Text>
            <Heading style={h1}>Welcome aboard, {userName}!</Heading>
            <Text style={tagline}>
              Your API development journey starts here
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Thank you for joining {appName}! We&apos;ve built the ultimate
              platform for developers who want to build, test, and collaborate
              on APIs with ease.
            </Text>

            <Text style={sectionTitle}>What you can do with {appName}:</Text>

            {/* Feature Grid */}
            <Section style={featureGrid}>
              <Row>
                <Column style={featureCard}>
                  <Text style={featureIcon}>⚡</Text>
                  <Text style={featureTitle}>API Requests</Text>
                  <Text style={featureDesc}>
                    Build and test REST, GraphQL, and WebSocket APIs with an
                    intuitive interface
                  </Text>
                </Column>
                <Column style={featureCard}>
                  <Text style={featureIcon}>📁</Text>
                  <Text style={featureTitle}>Collections</Text>
                  <Text style={featureDesc}>
                    Organize your API requests into collections for better
                    workflow management
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column style={featureCard}>
                  <Text style={featureIcon}>🌍</Text>
                  <Text style={featureTitle}>Environments</Text>
                  <Text style={featureDesc}>
                    Switch between dev, staging, and production with one click
                  </Text>
                </Column>
                <Column style={featureCard}>
                  <Text style={featureIcon}>🔔</Text>
                  <Text style={featureTitle}>Webhooks</Text>
                  <Text style={featureDesc}>
                    Test and debug webhooks with our built-in webhook testing
                    tools
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column style={featureCard}>
                  <Text style={featureIcon}>👥</Text>
                  <Text style={featureTitle}>Team Workspaces</Text>
                  <Text style={featureDesc}>
                    Collaborate with your team in shared workspaces with
                    role-based access
                  </Text>
                </Column>
                <Column style={featureCard}>
                  <Text style={featureIcon}>🔐</Text>
                  <Text style={featureTitle}>Secure Auth</Text>
                  <Text style={featureDesc}>
                    Manage OAuth, API keys, Bearer tokens, and more with our
                    auth system
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Getting Started Box */}
            <Section style={gettingStartedBox}>
              <Text style={gettingStartedTitle}>🎯 Quick Start Guide</Text>
              <Text style={stepItem}>
                <strong>1.</strong> Create your first workspace to organize your
                projects
              </Text>
              <Text style={stepItem}>
                <strong>2.</strong> Add a new collection and create your first
                API request
              </Text>
              <Text style={stepItem}>
                <strong>3.</strong> Set up environments for different stages
                (dev/prod)
              </Text>
              <Text style={stepItem}>
                <strong>4.</strong> Invite your team members to collaborate
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button type="button" style={button} href={loginUrl}>
                Open {appName}
              </Button>
            </Section>

            <Text style={accountInfo}>
              Your account: <strong>{userEmail}</strong>
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help getting started?{" "}
              <Link href="https://apistudio.dev/docs" style={link}>
                Check out our docs
              </Link>{" "}
              or just reply to this email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://apistudio.dev" style={footerLink}>
                Website
              </Link>
              {" • "}
              <Link href="https://apistudio.dev/docs" style={footerLink}>
                Documentation
              </Link>
              {" • "}
              <Link href="https://twitter.com/apistudio" style={footerLink}>
                Twitter
              </Link>
            </Text>
            <Text style={copyright}>
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
  padding: "0",
  marginBottom: "64px",
  borderRadius: "16px",
  marginTop: "30px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  maxWidth: "600px",
  overflow: "hidden",
};

const header = {
  padding: "40px 48px 32px",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
};

const logoText = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  letterSpacing: "1px",
  margin: "0 0 16px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px",
  padding: "0",
};

const tagline = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "32px 48px",
};

const paragraph = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 24px",
};

const sectionTitle = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const featureGrid = {
  margin: "0 0 24px",
};

const featureCard = {
  padding: "16px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  margin: "8px",
  verticalAlign: "top" as const,
  width: "45%",
};

const featureIcon = {
  fontSize: "24px",
  margin: "0 0 8px",
};

const featureTitle = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const featureDesc = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const gettingStartedBox = {
  margin: "24px 0",
  padding: "24px",
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  border: "1px solid #bbf7d0",
};

const gettingStartedTitle = {
  color: "#166534",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const stepItem = {
  color: "#15803d",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 8px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0 16px",
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 40px",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
};

const accountInfo = {
  color: "#64748b",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "0",
};

const footer = {
  padding: "24px 48px",
  backgroundColor: "#f8fafc",
};

const footerText = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 12px",
  textAlign: "center" as const,
};

const footerLinks = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0 0 12px",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#6366f1",
  textDecoration: "none",
};

const link = {
  color: "#6366f1",
  textDecoration: "underline",
};

const copyright = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0",
  textAlign: "center" as const,
};

export default WelcomeEmail;
