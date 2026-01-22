import { isCuid2 } from './isCuid';

/**
 * Converts Next.js path pattern to regex for matching
 */
export const patternToRegex = (pattern: string): RegExp => {
	// Cache compiled regexes to avoid recompilation
	if (!patternToRegex._cache) {
		patternToRegex._cache = new Map<string, RegExp>();
	}

	const cached = patternToRegex._cache.get(pattern);
	if (cached) {
		return cached;
	}

	const regex = pattern
		// Escape special regex characters
		.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		// Handle optional catch-all routes: [[...param]]
		.replace(/\\\[\\\[\\\.\\\.\\\.(.*?)\\\]\\\]/g, '(?:\\/(.*))?')
		// Handle catch-all routes: [...param]
		.replace(/\\\[\\\.\\\.\\\.(.*?)\\\]/g, '\\/(.+)')
		// Handle dynamic segments: [param]
		.replace(/\\\[(.*?)\\\]/g, '([^/]+)');

	const compiled = new RegExp(`^${regex}$`);
	patternToRegex._cache.set(pattern, compiled);

	return compiled;
};
patternToRegex._cache = new Map<string, RegExp>();

/**
 * Checks if a path matches any provided route patterns
 * Returns true if exact match or any pattern matches
 */
export const matchesRoutePattern = (
	path: string,
	currentPath: string,
	patterns?: string[],
): boolean => {
	// Fast path: exact match
	if (path === currentPath) {
		return true;
	}

	// No patterns means no additional matching
	if (!patterns?.length) {
		return false;
	}

	// Check pattern matches
	return patterns.some((pattern) => patternToRegex(pattern).test(path));
};

/**
 * Interface for URL IDs to improve type safety
 */
export interface UrlIds {
	readonly organizationSlug: string | undefined;
	readonly teamId: string | undefined;
	readonly flowId: string | undefined;
}

/**
 * Extracts organization, team, and flow IDs from URL pathname
 * Expected format: /[slug]/[teamId]/[flowId]
 */
export const getUrlIds = (pathname: string): UrlIds => {
	const segments = pathname.split('/').filter(Boolean);

	// Early return for short paths
	if (segments.length <= 1) {
		return {
			organizationSlug: undefined,
			teamId: undefined,
			flowId: undefined,
		};
	}

	const validateAndGet = (index: number): string | undefined =>
		segments[index] && isCuid2(segments[index])
			? segments[index]
			: undefined;

	return {
		organizationSlug: validateAndGet(0),
		teamId: validateAndGet(1),
		flowId: validateAndGet(2),
	};
};

/**
 * Alternative optimized version using destructuring for better performance
 */
export const getUrlIdsOptimized = (pathname: string): UrlIds => {
	const segments = pathname.split('/').filter(Boolean);
	const [segment1, segment2, segment3] = segments;

	return {
		organizationSlug: segment1 && isCuid2(segment1) ? segment1 : undefined,
		teamId: segment2 && isCuid2(segment2) ? segment2 : undefined,
		flowId: segment3 && isCuid2(segment3) ? segment3 : undefined,
	};
};

/**
 * Utility to clear all pattern caches (useful for testing or memory management)
 */
export const clearPatternCache = (): void => {
	patternToRegex._cache.clear();
	compiledPatternCache.clear();
};

/**
 * Get cache statistics for monitoring
 */
export const getPatternCacheStats = () => ({
	legacyCache: {
		size: patternToRegex._cache.size,
		patterns: Array.from(patternToRegex._cache.keys()),
	},
	compiledCache: {
		size: compiledPatternCache.size,
		patterns: Array.from(compiledPatternCache.keys()),
	},
});

/**
 * Universal URL matcher functions for TypeScript applications
 * Supports regex patterns, glob patterns, and parameter matching
 */

export interface MatchResult {
	matched: boolean;
	params?: Record<string, string>;
	segments?: string[];
	pattern?: string;
}

/**
 * Check if a pattern is a regex pattern
 */
export function isRegexPattern(pattern: string): boolean {
	// If it contains Next.js route patterns or colon params, it's not a regex
	if (
		pattern.includes('/:') ||
		/\[[^\]]+\]/.test(pattern) ||
		pattern.includes('**') ||
		(pattern.includes('*') && !pattern.match(/^\/.+\/[gimuy]*$/))
	) {
		return false;
	}

	// Check if it's in the format /pattern/flags
	if (pattern.match(/^\/(.+)\/([gimuy]*)$/)) {
		return true;
	}

	// Otherwise, check for complex regex characters that wouldn't be in route patterns
	return /[(){}^$|\\]/.test(pattern) && !pattern.includes('*');
}

/**
 * Parse a regex pattern string into RegExp
 */
export function parseRegexPattern(pattern: string): RegExp {
	// Handle patterns like "/(regex content)" or "/regex/flags"
	const match = pattern.match(/^\/(.+?)\/([gimuy]*)$/);
	if (match) {
		return new RegExp(match[1], match[2]);
	}

	// If it doesn't match the /pattern/flags format, treat as literal regex
	const regexContent = pattern.startsWith('/') ? pattern.slice(1) : pattern;
	return new RegExp(regexContent);
}

/**
 * Convert glob/parameter pattern to regex with named capture groups
 */
export function convertToRegex(pattern: string): RegExp {
	let regexPattern = pattern;
	const paramNames: string[] = [];

	// Replace Next.js dynamic route patterns first (before escaping)
	regexPattern = regexPattern.replace(/\[([^\]]+)\]/g, (match, paramName) => {
		paramNames.push(paramName);
		return `___PARAM_${paramName}___`;
	});

	// Replace colon parameter patterns (before escaping)
	regexPattern = regexPattern.replace(/:([^/]+)/g, (match, paramName) => {
		paramNames.push(paramName);
		return `___PARAM_${paramName}___`;
	});

	// Replace wildcards (before escaping)
	regexPattern = regexPattern.replace(/\*\*/g, '___DOUBLESTAR___');
	regexPattern = regexPattern.replace(/\*/g, '___STAR___');

	// Now escape special regex characters
	regexPattern = regexPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

	// Restore the patterns with proper regex syntax using named groups
	regexPattern = regexPattern.replace(/___PARAM_([^_]+)___/g, '(?<$1>[^/]+)');
	regexPattern = regexPattern.replace(/___DOUBLESTAR___/g, '(.*)');
	regexPattern = regexPattern.replace(/___STAR___/g, '([^/]*)');

	// Ensure the pattern matches the entire string
	regexPattern = `^${regexPattern}$`;

	return new RegExp(regexPattern);
}

// Cache for compiled patterns
const compiledPatternCache = new Map<string, RegExp>();

/**
 * Compile a single pattern into a RegExp with caching
 */
export function compilePattern(pattern: string): RegExp {
	// Check cache first
	const cached = compiledPatternCache.get(pattern);
	if (cached) {
		return cached;
	}

	let compiled: RegExp;

	try {
		// If it's already a regex pattern (starts with / and contains regex chars)
		if (pattern.startsWith('/') && isRegexPattern(pattern)) {
			compiled = parseRegexPattern(pattern);
		} else {
			// Convert glob/parameter pattern to regex
			compiled = convertToRegex(pattern);
		}
	} catch {
		// Fallback to exact match on error
		compiled = new RegExp(
			`^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
		);
	}

	// Cache the result
	compiledPatternCache.set(pattern, compiled);
	return compiled;
}

/**
 * Extract parameters and segments from a matched URL
 */
export function extractParamsAndSegments(
	url: string,
	regex: RegExp,
): { params: Record<string, string>; segments: string[] } {
	const match = url.match(regex);
	if (!match) {
		return { params: {}, segments: [] };
	}

	// Extract named groups as params
	const params = match.groups || {};

	// Extract all captured groups as segments (excluding the full match)
	const segments = match.slice(1).filter((segment) => segment !== undefined);

	return { params, segments };
}

/**
 * Match a single URL against a single pattern
 */
export function matchPattern(url: string, pattern: string): MatchResult {
	const compiledPattern = compilePattern(pattern);

	if (compiledPattern.test(url)) {
		const { params, segments } = extractParamsAndSegments(
			url,
			compiledPattern,
		);
		return {
			matched: true,
			params: Object.keys(params).length > 0 ? params : undefined,
			segments: segments.length > 0 ? segments : undefined,
			pattern,
		};
	}

	return { matched: false };
}

/**
 * Match URL against multiple patterns
 */
export function matchUrl(url: string, patterns: string[]): MatchResult {
	for (const pattern of patterns) {
		const result = matchPattern(url, pattern);
		if (result.matched) {
			return result;
		}
	}

	return { matched: false };
}

/**
 * Check if URL matches any of the patterns (simple boolean check)
 */
export function isUrlMatched(url: string, patterns: string[]): boolean {
	return matchUrl(url, patterns).matched;
}

/**
 * Batch compile patterns for better performance when matching many URLs
 */
export function createMatcher(patterns: string[]) {
	const compiledPatterns = new Map<string, RegExp>();

	patterns.forEach((pattern) => {
		try {
			compiledPatterns.set(pattern, compilePattern(pattern));
		} catch {
			// Skip patterns that fail to compile
		}
	});

	return {
		match: (url: string): MatchResult => {
			for (const [pattern, regex] of compiledPatterns) {
				if (regex.test(url)) {
					const { params, segments } = extractParamsAndSegments(
						url,
						regex,
					);
					return {
						matched: true,
						params:
							Object.keys(params).length > 0 ? params : undefined,
						segments: segments.length > 0 ? segments : undefined,
						pattern,
					};
				}
			}
			return { matched: false };
		},

		test: (url: string): boolean => {
			for (const regex of compiledPatterns.values()) {
				if (regex.test(url)) {
					return true;
				}
			}
			return false;
		},
	};
}
