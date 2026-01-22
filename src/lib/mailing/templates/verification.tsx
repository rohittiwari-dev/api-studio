import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
	Button,
	Hr,
} from '@react-email/components';

interface VerificationEmailProps {
	userName: string;
	verificationUrl?: string;
	expiresIn?: string;
	appName?: string;
}

export function VerificationEmail({
	userName,
	verificationUrl,
	expiresIn = '15 minutes',
	appName = 'API Studio',
}: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Your {appName} verification link</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Header */}
					<Section style={header}>
						<Heading style={h1}>Verify Your Email ✉️</Heading>
					</Section>

					{/* Content */}
					<Section style={content}>
						<Text style={greeting}>Hi {userName},</Text>

						<Text style={paragraph}>
							Please click the button below to complete your email
							verification for {appName}:
						</Text>

						{verificationUrl && (
							<>
								<Section style={buttonSection}>
									<Button
										style={button}
										href={verificationUrl}
									>
										Verify Email
									</Button>
								</Section>
							</>
						)}

						<Text style={expireNote}>
							This code will expire in{' '}
							<strong>{expiresIn}</strong>. If you didn&apos;t
							request this verification, you can safely ignore
							this email.
						</Text>
					</Section>

					<Hr style={hr} />

					{/* Footer */}
					<Section style={footer}>
						<Text style={footerText}>
							Need help?{' '}
							<Link
								href="mailto:support@apistudio.dev"
								style={link}
							>
								Contact our support team
							</Link>
						</Text>
						<Text style={footerText}>
							© {new Date().getFullYear()} {appName}. All rights
							reserved.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Styles
const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '20px 0 48px',
	marginBottom: '64px',
	borderRadius: '12px',
	marginTop: '30px',
	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
	maxWidth: '600px',
};

const header = {
	padding: '32px 48px 24px',
	textAlign: 'center' as const,
};

const h1 = {
	color: '#1a1a1a',
	fontSize: '28px',
	fontWeight: '700',
	margin: '0',
	padding: '0',
};

const content = {
	padding: '0 48px',
};

const greeting = {
	color: '#1a1a1a',
	fontSize: '18px',
	fontWeight: '600',
	margin: '0 0 16px',
};

const paragraph = {
	color: '#4a4a4a',
	fontSize: '16px',
	lineHeight: '26px',
	margin: '0 0 16px',
};

const codeSection = {
	margin: '32px 0',
	padding: '32px',
	backgroundColor: '#f8fafc',
	borderRadius: '12px',
	border: '2px dashed #6366f1',
	textAlign: 'center' as const,
};

const codeLabel = {
	color: '#6366f1',
	fontSize: '11px',
	fontWeight: '600',
	letterSpacing: '2px',
	margin: '0 0 12px',
};

const code = {
	color: '#1a1a1a',
	fontSize: '36px',
	fontWeight: '700',
	letterSpacing: '8px',
	margin: '0',
	fontFamily: 'monospace',
};

const orText = {
	color: '#8898aa',
	fontSize: '14px',
	textAlign: 'center' as const,
	margin: '0 0 16px',
};

const buttonSection = {
	textAlign: 'center' as const,
	margin: '0 0 24px',
};

const button = {
	backgroundColor: '#6366f1',
	borderRadius: '8px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: '600',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'inline-block',
	padding: '14px 32px',
};

const expireNote = {
	color: '#8898aa',
	fontSize: '14px',
	lineHeight: '22px',
	margin: '16px 0 0',
	textAlign: 'center' as const,
};

const hr = {
	borderColor: '#e6ebf1',
	margin: '32px 0',
};

const footer = {
	padding: '0 48px',
};

const footerText = {
	color: '#8898aa',
	fontSize: '14px',
	lineHeight: '22px',
	margin: '0 0 8px',
	textAlign: 'center' as const,
};

const link = {
	color: '#6366f1',
	textDecoration: 'underline',
};

export default VerificationEmail;
