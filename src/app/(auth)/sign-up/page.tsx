import React from 'react';
import AuthForm from '@/modules/authentication/components/auth-form';

const SignUpPage = async ({
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
				type="sign-up"
				content_flow="right"
				error={error}
				error_description={error_description}
			/>
		</div>
	);
};

export default SignUpPage;
