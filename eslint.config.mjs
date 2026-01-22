import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
	eslintConfigPrettier,
	{
		ignores: [
			'node_modules/',
			'.next/',
			'dist/',
			'build/',
			'public/',
			'*.config.js',
			'/src/generated/',
		],
	},
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
	[
		{
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
			},
		},
	],
]);

export default eslintConfig;
