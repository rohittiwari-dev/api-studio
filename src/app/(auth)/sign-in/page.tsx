import React from 'react';
import AuthForm from '@/modules/authentication/components/auth-form';

const SignInPage = async ({
	searchParams,
}: {
	searchParams: Promise<{
		error?: string;
		error_description?: string;
	}>;
}) => {
	const { error, error_description } = await searchParams;

	return (
		<div>
			<AuthForm
				type="sign-in"
				error={error}
				error_description={error_description}
			/>
		</div>
	);
};

export default SignInPage;
