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

interface InvitationEmailProps {
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  inviteUrl: string;
  recipientName?: string;
  appName?: string;
}

export function InvitationEmail({
  inviterName,
  inviterEmail,
  workspaceName,
  inviteUrl,
  recipientName,
  appName = "API Studio",
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {workspaceName} on {appName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>You&apos;re Invited! 🎉</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>
              Hi{recipientName ? ` ${recipientName}` : ""},
            </Text>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
              collaborate on the <strong>{workspaceName}</strong> workspace in{" "}
              {appName}.
            </Text>

            {/* Workspace Card */}
            <Section style={workspaceCard}>
              <Text style={workspaceLabel}>WORKSPACE</Text>
              <Text style={workspaceName_}>{workspaceName}</Text>
              <Text style={invitedBy}>Invited by {inviterName}</Text>
            </Section>

            <Text style={paragraph}>
              Join the workspace to start collaborating on API collections,
              environments, and more with your team.
            </Text>

            <Section style={buttonSection}>
              <Button type="button" style={button} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={expireNote}>
              This invitation will expire in 7 days. If you weren&apos;t
              expecting this email, you can safely ignore it.
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
              <Link href={inviteUrl} style={link}>
                {inviteUrl}
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
  marginTop: "30px",
  marginBottom: "64px",
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

const workspaceCard = {
  margin: "24px 0",
  padding: "24px",
  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  background: "#6366f1",
  borderRadius: "12px",
  textAlign: "center" as const,
};

const workspaceLabel = {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "1px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const workspaceName_ = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const invitedBy = {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  margin: "0",
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

const expireNote = {
  color: "#8898aa",
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: "16px 0 0",
  textAlign: "center" as const,
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

export default InvitationEmail;
