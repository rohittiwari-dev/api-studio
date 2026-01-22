import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const env = createEnv({
	server: {
		DATABASE_URL: z.string(),
		BETTER_AUTH_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		REDIS_URL: z.string(),
		// SMTP Configuration
		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.string().optional(),
		SMTP_SECURE: z.string().optional(),
		SMTP_USER: z.string().optional(),
		SMTP_PASSWORD: z.string().optional(),
		SMTP_FROM: z.string().optional(),
	},
	client: {
		NEXT_PUBLIC_WEB_PUBLIC_URL: z.string(),
	},
	experimental__runtimeEnv: {
		...process.env,
		NEXT_PUBLIC_WEB_PUBLIC_URL: process.env['NEXT_PUBLIC_WEB_PUBLIC_URL'],
	},
});

export default env;
