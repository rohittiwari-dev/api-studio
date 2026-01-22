import nodemailer from 'nodemailer';

export interface SendEmailOptions {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
}

// Create Gmail transporter
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
});

/**
 * Send an email using Gmail SMTP
 */
export async function sendEmail(options: SendEmailOptions) {
	try {
		const info = await transporter.sendMail({
			from: `Api Studio <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
			to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
		});

		return { success: true, messageId: info.messageId };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Send email with React template
 * Example:
 *   import { WelcomeEmail } from "@/lib/mailing/templates";
 *   await sendEmailWithTemplate({
 *     to: "user@example.com",
 *     subject: "Welcome!",
 *     template: <WelcomeEmail userName="John" userEmail="john@example.com" />,
 *   });
 */
export async function sendEmailWithTemplate(
	options: Omit<SendEmailOptions, 'html' | 'text'> & {
		template: React.ReactElement;
	},
) {
	const { render } = await import('@react-email/render');

	const html = await render(options.template);
	const text = await render(options.template, { plainText: true });

	return sendEmail({ ...options, html, text });
}

export default sendEmail;
