/**
 * Substitutes {{variableName}} placeholders with values from the variables object.
 * Supports nested variable references and handles missing variables gracefully.
 */
export function substituteVariables(
	text: string,
	variables: Record<string, string>,
): string {
	if (!text || typeof text !== 'string') {
		return text;
	}
	if (!variables || Object.keys(variables).length === 0) {
		return text;
	}

	// Match {{variableName}} pattern
	const regex = /\{\{([^{}]+)\}\}/g;

	return text.replace(regex, (match, variableName) => {
		const trimmedName = variableName?.trim();
		if (trimmedName in variables) {
			return variables[trimmedName];
		}
		// Return original if variable not found
		return match;
	});
}

/**
 * Substitutes variables in an object recursively.
 * Works with nested objects and arrays.
 */
export function substituteVariablesInObject<T>(
	obj: T,
	variables: Record<string, string>,
): T {
	if (!obj || !variables || Object.keys(variables).length === 0) {
		return obj;
	}

	if (typeof obj === 'string') {
		return substituteVariables(obj, variables) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) =>
			substituteVariablesInObject(item, variables),
		) as T;
	}

	if (typeof obj === 'object' && obj !== null) {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = substituteVariablesInObject(value, variables);
		}
		return result as T;
	}

	return obj;
}

/**
 * Extracts all variable names from a text string.
 * Useful for highlighting or validation.
 */
export function extractVariableNames(text: string): string[] {
	if (!text || typeof text !== 'string') {
		return [];
	}

	const regex = /\{\{([^{}]+)\}\}/g;
	const matches: string[] = [];
	let match;

	while ((match = regex.exec(text)) !== null) {
		matches.push(match[1]?.trim());
	}

	return [...new Set(matches)];
}

/**
 * Checks if a text contains any variable placeholders.
 */
export function hasVariables(text: string): boolean {
	if (!text || typeof text !== 'string') {
		return false;
	}
	return /\{\{[^{}]+\}\}/.test(text);
}
