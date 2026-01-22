'use client';

import React, {
	useMemo,
	useState,
	useRef,
	useCallback,
	useEffect,
} from 'react';
import {
	Rocket,
	Search,
	ChevronUp,
	ChevronDown,
	X,
	Download,
	Sparkles,
	FileCode,
	Eye,
	TreeDeciduous,
} from 'lucide-react';
import { CodeEditor } from '@/components/ui/code-editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type ResponseType = 'json' | 'xml' | 'html' | 'text';

interface ResponseBodyTabContentProps {
	responseData?: string | object;
	contentType?: string;
}

// Helper: Convert JSON to XML
const jsonToXml = (json: any, rootName: string = 'root'): string => {
	const toXml = (v: any, name: string): string => {
		if (v === null) {
			return `<${name} xsi:nil="true"/>`;
		}
		if (typeof v === 'undefined') {
			return '';
		}
		if (Array.isArray(v)) {
			return v.map((item) => toXml(item, name)).join('');
		}
		if (typeof v === 'object') {
			let xml = '';
			Object.entries(v).forEach(([key, value]) => {
				// Handle array items differently if needed, but for simple conversion:
				xml += toXml(value, key);
			});
			return name ? `<${name}>${xml}</${name}>` : xml;
		}
		// Escape special chars
		const str = v
			.toString()
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');
		return `<${name}>${str}</${name}>`;
	};

	try {
		if (typeof json === 'string') {
			json = JSON.parse(json);
		}
		return toXml(json, rootName);
	} catch (e) {
		return '<error>Invalid JSON</error>';
	}
};

// Helper: Convert XML to JSON
const xmlToJson = (xml: string): any => {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(xml, 'text/xml');

		const parseNode = (node: Node): any => {
			if (node.nodeType === Node.TEXT_NODE) {
				if (node.textContent?.trim() === '') {
					return null;
				}
				return node.textContent;
			}
			if (node.nodeType === Node.ELEMENT_NODE) {
				const obj: any = {};
				const attributes = (node as Element).attributes;
				if (attributes.length > 0) {
					obj['@attributes'] = {};
					for (let i = 0; i < attributes.length; i++) {
						const attr = attributes[i];
						obj['@attributes'][attr.name] = attr.value;
					}
				}

				if (node.hasChildNodes()) {
					// Check if only text child
					if (
						node.childNodes.length === 1 &&
						node.childNodes[0].nodeType === Node.TEXT_NODE
					) {
						const text = node.textContent;
						if (attributes.length === 0) {
							return text;
						}
						obj['#text'] = text;
					} else {
						// Collect children
						for (let i = 0; i < node.childNodes.length; i++) {
							const child = node.childNodes[i];
							const childName = child.nodeName;
							if (
								child.nodeType === Node.TEXT_NODE &&
								!child.textContent?.trim()
							) {
								continue;
							}

							const childVal = parseNode(child);
							if (obj[childName]) {
								if (!Array.isArray(obj[childName])) {
									obj[childName] = [obj[childName]];
								}
								obj[childName].push(childVal);
							} else {
								obj[childName] = childVal;
							}
						}
					}
				}
				return obj;
			}
		};

		const result: any = {};
		if (doc.documentElement) {
			result[doc.documentElement.nodeName] = parseNode(
				doc.documentElement,
			);
		}
		return result;
	} catch (e) {
		return { error: 'Invalid XML' };
	}
};

const ResponseBodyTabContent: React.FC<ResponseBodyTabContentProps> = ({
	responseData = '',
	contentType = '',
}) => {
	// Auto-detect response type from content-type header
	const detectResponseType = useCallback(
		(contentType: string): ResponseType => {
			const lowerContentType = contentType.toLowerCase();

			if (
				lowerContentType.includes('application/json') ||
				lowerContentType.includes('json')
			) {
				return 'json';
			} else if (
				lowerContentType.includes('application/xml') ||
				lowerContentType.includes('text/xml') ||
				lowerContentType.includes('xml')
			) {
				return 'xml';
			} else if (
				lowerContentType.includes('text/html') ||
				lowerContentType.includes('html')
			) {
				return 'html';
			} else if (
				lowerContentType.includes('text/plain') ||
				lowerContentType.includes('text/')
			) {
				return 'text';
			}

			// Default fallback - try to detect from content
			if (typeof responseData === 'string') {
				const trimmed = responseData?.trim();
				if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
					return 'json';
				} else if (
					trimmed.startsWith('<?xml') ||
					trimmed.startsWith('<')
				) {
					if (
						trimmed.includes('<!DOCTYPE html') ||
						trimmed.toLowerCase().includes('<html')
					) {
						return 'html';
					}
					return 'xml';
				}
			}

			return 'json'; // default
		},
		[responseData],
	);

	const [responseType, setResponseType] = useState<ResponseType>(() =>
		detectResponseType(contentType),
	);

	// Search state
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<number[]>([]);
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	// Update response type when contentType changes
	React.useEffect(() => {
		const detectedType = detectResponseType(contentType);
		setResponseType(detectedType);
	}, [contentType, detectResponseType]);

	// Format JSON with syntax highlighting
	const formatJSON = (data: string | object) => {
		try {
			const parsed = typeof data === 'string' ? JSON.parse(data) : data;
			return JSON.stringify(parsed, null, 2);
		} catch (error) {
			return typeof data === 'string' ? data : JSON.stringify(data);
		}
	};

	// Format XML with indentation
	const formatXML = (xml: string) => {
		try {
			const PADDING = '  ';
			const reg = /(>)(<)(\/*)/g;
			const formatted = xml.replace(reg, '$1\n$2$3');
			let pad = 0;

			return formatted
				.split('\n')
				.map((node) => {
					let indent = 0;
					if (node.match(/.+<\/\w[^>]*>$/)) {
						indent = 0;
					} else if (node.match(/^<\/\w/)) {
						if (pad !== 0) {
							pad -= 1;
						}
					} else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
						indent = 1;
					} else {
						indent = 0;
					}

					const padding = PADDING.repeat(pad);
					pad += indent;
					return padding + node;
				})
				.join('\n');
		} catch (error) {
			return xml;
		}
	};

	const rawResponse = useMemo(() => {
		if (responseData) {
			if (typeof responseData === 'string') {
				return responseData;
			}
			// If responseData is an object, stringify it
			return JSON.stringify(responseData, null, 2);
		}
		return '';
	}, [responseData]);

	// Computed converted content based on selected type
	const convertedContent = useMemo(() => {
		const detectedOriginalType = detectResponseType(contentType);

		// No conversion needed if types match or if target is Text/HTML (usually just raw)
		if (responseType === detectedOriginalType || responseType === 'text') {
			// For JSON, ensure it's formatted
			if (responseType === 'json') {
				return formatJSON(responseData);
			}
			if (responseType === 'xml') {
				return formatXML(rawResponse);
			}
			return rawResponse;
		}

		// Conversion logic
		if (detectedOriginalType === 'json' && responseType === 'xml') {
			return formatXML(jsonToXml(responseData));
		}
		if (detectedOriginalType === 'xml' && responseType === 'json') {
			return formatJSON(xmlToJson(rawResponse));
		}

		return rawResponse;
	}, [
		detectResponseType,
		contentType,
		responseType,
		rawResponse,
		responseData,
	]);

	// Handle file download
	const handleDownload = () => {
		const type = detectResponseType(contentType);
		const extensionMap: Record<string, string> = {
			json: 'json',
			xml: 'xml',
			html: 'html',
			text: 'txt',
		};
		const extension = extensionMap[type] || 'txt';

		const blob = new Blob([rawResponse], {
			type: contentType || 'text/plain',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `response.${extension}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const scrollToMatch = useCallback(
		(index: number, matches: number[], query: string) => {
			if (!contentRef.current || matches.length === 0) {
				return;
			}

			// Find the line number containing the match (simplistic, assumes per-line rendering matches source lines)
			// Actually sticky lines might differ.
			const lines = convertedContent
				.substring(0, matches[index])
				.split('\n');
			const lineNumber = lines.length;

			// Find the line element and scroll to it
			const lineElements = contentRef.current.querySelectorAll(
				'.line, [class*="line"]',
			);
			if (lineElements[lineNumber - 1]) {
				lineElements[lineNumber - 1].scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
			}
		},
		[convertedContent],
	);
	// Search functionality
	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query);
			if (!query?.trim() || !contentRef.current) {
				setSearchResults([]);
				setCurrentMatchIndex(0);
				return;
			}

			// Find all matches in the content
			const content = convertedContent.toLowerCase(); // Search in converted content!
			const searchLower = query.toLowerCase();
			const matches: number[] = [];
			let pos = 0;
			while ((pos = content.indexOf(searchLower, pos)) !== -1) {
				matches.push(pos);
				pos += searchLower.length;
			}
			setSearchResults(matches);
			setCurrentMatchIndex(0);

			// Scroll to first match
			if (matches.length > 0) {
				scrollToMatch(0, matches, query);
			}
		},
		[convertedContent, scrollToMatch],
	);

	const navigateMatch = useCallback(
		(direction: 'prev' | 'next') => {
			if (searchResults.length === 0) {
				return;
			}

			let newIndex = currentMatchIndex;
			if (direction === 'next') {
				newIndex = (currentMatchIndex + 1) % searchResults.length;
			} else {
				newIndex =
					currentMatchIndex === 0
						? searchResults.length - 1
						: currentMatchIndex - 1;
			}

			setCurrentMatchIndex(newIndex);
			scrollToMatch(newIndex, searchResults, searchQuery);
		},
		[currentMatchIndex, searchResults, searchQuery, scrollToMatch],
	);

	const clearSearch = useCallback(() => {
		setSearchQuery('');
		setSearchResults([]);
		setCurrentMatchIndex(0);
		setIsSearchOpen(false);
		// Remove highlights
		if (contentRef.current) {
			const marks = contentRef.current.querySelectorAll(
				'mark.search-highlight',
			);
			marks.forEach((mark) => {
				const parent = mark.parentNode;
				if (parent) {
					parent.replaceChild(
						document.createTextNode(mark.textContent || ''),
						mark,
					);
					parent.normalize();
				}
			});
		}
	}, []);

	// Highlight search matches in the DOM
	useEffect(() => {
		if (!contentRef.current) {
			return;
		}

		// Use a small delay to ensure the DOM is fully rendered
		const timeoutId = setTimeout(() => {
			if (!contentRef.current) {
				return;
			}

			// First, remove any existing highlights by replacing mark elements with their text content
			const removeHighlights = () => {
				const marks = contentRef.current?.querySelectorAll(
					'mark.search-highlight',
				);
				marks?.forEach((mark) => {
					const textNode = document.createTextNode(
						mark.textContent || '',
					);
					mark.parentNode?.replaceChild(textNode, mark);
				});
				// Normalize after all marks are removed
				contentRef.current?.normalize();
			};

			removeHighlights();

			// If no search query, we're done
			if (!searchQuery?.trim()) {
				return;
			}

			const searchLower = searchQuery.toLowerCase();

			// Collect all text nodes first (after cleanup)
			const collectTextNodes = (): Text[] => {
				const nodes: Text[] = [];
				const walker = document.createTreeWalker(
					contentRef.current!,
					NodeFilter.SHOW_TEXT,
					null,
				);
				let node;
				while ((node = walker.nextNode())) {
					nodes.push(node as Text);
				}
				return nodes;
			};

			const textNodes = collectTextNodes();
			let matchCount = 0;

			// Process each text node
			textNodes.forEach((node) => {
				const text = node.textContent || '';
				const lowerText = text.toLowerCase();

				// Check if this node contains any matches
				if (!lowerText.includes(searchLower)) {
					return;
				}

				// Build the replacement fragment
				const fragment = document.createDocumentFragment();
				let lastIndex = 0;
				let index = lowerText.indexOf(searchLower);

				while (index !== -1) {
					// Add text before match
					if (index > lastIndex) {
						fragment.appendChild(
							document.createTextNode(
								text.substring(lastIndex, index),
							),
						);
					}

					// Create highlighted mark element
					const mark = document.createElement('mark');
					// Current match gets orange, others get yellow
					const isCurrentMatch = matchCount === currentMatchIndex;
					mark.className = isCurrentMatch
						? 'search-highlight bg-orange-400 dark:bg-orange-500/70 text-inherit rounded-sm ring-2 ring-orange-500'
						: 'search-highlight bg-yellow-300 dark:bg-yellow-500/50 text-inherit rounded-sm';
					mark.textContent = text.substring(
						index,
						index + searchQuery.length,
					);
					fragment.appendChild(mark);

					matchCount++;
					lastIndex = index + searchQuery.length;
					index = lowerText.indexOf(searchLower, lastIndex);
				}

				// Add remaining text after last match
				if (lastIndex < text.length) {
					fragment.appendChild(
						document.createTextNode(text.substring(lastIndex)),
					);
				}

				// Replace the original text node with the fragment
				node.parentNode?.replaceChild(fragment, node);
			});
		}, 50);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, currentMatchIndex, convertedContent]); // Depends on convertedContent

	// Show empty state if no response data
	if (!responseData || rawResponse === '' || rawResponse === '""') {
		return (
			<div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
				<div className="size-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center">
					<Rocket className="size-7 text-primary/60" />
				</div>
				<div className="text-center space-y-1">
					<p className="text-sm font-semibold text-foreground">
						Ready to launch
					</p>
					<p className="text-xs text-muted-foreground max-w-[200px]">
						Hit Send to get a response
					</p>
				</div>
			</div>
		);
	}

	// Render Pretty content based on response type
	const renderPrettyContent = () => {
		return (
			<div className="bg-muted/30 border-border mt-1 flex flex-col flex-1 min-h-0 rounded border text-[11px]">
				<CodeEditor
					writing={false}
					header={false}
					lang={responseType}
					className="h-full! flex-1 min-h-0 w-full border-none [&_code]:text-[11px]! [&_.line]:leading-4!"
					contentClassName="!p-1"
					copyButton
				>
					{convertedContent}
				</CodeEditor>
			</div>
		);
	};

	const renderRawContent = () => {
		return (
			<div className="bg-muted/30 border-border mt-1 flex flex-col flex-1 min-h-0 rounded border text-[11px]">
				<CodeEditor
					writing={false}
					header={false}
					lang={'plain'}
					className="h-full! flex-1 min-h-0 w-full border-none [&_code]:text-[11px]! [&_.line]:leading-4!"
					contentClassName="!p-1"
					copyButton
				>
					{rawResponse}
				</CodeEditor>
			</div>
		);
	};

	// Render Preview content based on response type
	const renderPreviewContent = () => {
		switch (responseType) {
			case 'html':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							HTML Rendered Preview
						</div>
						<div className="border-border flex-1 overflow-auto rounded border bg-white p-1 dark:bg-gray-900">
							<div
								className="dark:prose-invert prose prose-sm max-w-none text-[11px]! leading-tight"
								dangerouslySetInnerHTML={{
									__html: convertedContent,
								}}
							/>
						</div>
					</div>
				);
			case 'xml':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							XML Tree Structure
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border p-1">
							<CodeEditor
								writing={false}
								header={false}
								lang={responseType}
								className="h-full w-full border-none [&_code]:text-[11px]! [&_.line]:leading-4!"
								contentClassName="!p-1"
								copyButton
							>
								{convertedContent}
							</CodeEditor>
						</div>
					</div>
				);
			case 'json':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							JSON Preview
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border text-[11px] leading-4">
							<CodeEditor
								writing={false}
								header={false}
								lang={responseType}
								className="h-full w-full border-none [&_code]:text-[11px]! [&_.line]:leading-4!"
								contentClassName="!p-1"
								copyButton
							>
								{convertedContent}
							</CodeEditor>
						</div>
					</div>
				);
			case 'text':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							Text Content
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border text-[11px] whitespace-pre-wrap leading-4">
							<CodeEditor
								writing={false}
								header={false}
								lang={responseType}
								className="h-full w-full border-none [&_code]:text-[11px]! [&_.line]:leading-4!"
								contentClassName="!p-1"
								copyButton
							>
								{convertedContent}
							</CodeEditor>
						</div>
					</div>
				);
		}
	};

	// Render Visualize content based on response type
	const renderVisualizeContent = () => {
		switch (responseType) {
			case 'json':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							JSON Tree Visualization
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border p-1">
							{renderJSONVisualization(convertedContent)}
						</div>
					</div>
				);
			case 'xml':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							XML Tree Structure
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border p-1">
							<pre className="text-[11px] leading-4">
								<code className="font-mono whitespace-pre text-[11px]!">
									{formatXML(convertedContent)}
								</code>
							</pre>
						</div>
					</div>
				);
			case 'html':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							HTML Rendered Preview
						</div>
						<div className="border-border flex-1 overflow-auto rounded border bg-white p-1 dark:bg-gray-900">
							<div
								className="dark:prose-invert prose prose-sm max-w-none text-[11px]! leading-tight"
								dangerouslySetInnerHTML={{
									__html: convertedContent,
								}}
							/>
						</div>
					</div>
				);
			case 'text':
				return (
					<div className="bg-muted/30 border-border mt-2 rounded-md border flex flex-col flex-1 min-h-0">
						<div className="text-muted-foreground p-1.5 text-xs">
							Text Visualization
						</div>
						<div className="bg-background border-border flex-1 overflow-auto rounded border p-1">
							<div className="font-mono text-[11px] leading-4 whitespace-pre-wrap">
								{convertedContent}
							</div>
						</div>
					</div>
				);
		}
	};

	// Render JSON as tree visualization
	const renderJSONVisualization = (data: string) => {
		try {
			const parsed = typeof data === 'string' ? JSON.parse(data) : data;
			return (
				<div className="space-y-1 text-[11px]">
					{renderJSONTree(parsed)}
				</div>
			);
		} catch (error) {
			return (
				<div className="bg-destructive/10 border-destructive/20 text-destructive rounded border p-4">
					Invalid JSON:{' '}
					{error instanceof Error ? error.message : 'Unable to parse'}
				</div>
			);
		}
	};

	const renderJSONTree = (
		node: any,
		key?: string,
		level: number = 0,
	): React.ReactNode => {
		const indent = level * 12;

		if (
			node === null ||
			typeof node === 'string' ||
			typeof node === 'number' ||
			typeof node === 'boolean'
		) {
			return (
				<div
					style={{ paddingLeft: `${indent}px` }}
					className="hover:bg-muted/50 flex items-center gap-1.5 rounded px-1.5 py-0.5"
				>
					{key && (
						<span className="font-semibold text-blue-600 dark:text-blue-400">
							{key}:
						</span>
					)}
					<span className="text-foreground">
						{node === null
							? 'null'
							: typeof node === 'string'
								? `"${node}"`
								: node.toString()}
					</span>
					<span className="text-muted-foreground text-[11px]">
						({typeof node})
					</span>
				</div>
			);
		}

		if (Array.isArray(node)) {
			return (
				<div style={{ paddingLeft: `${indent}px` }}>
					<div className="hover:bg-muted/50 flex items-center gap-1.5 rounded px-1.5 py-0.5">
						{key && (
							<span className="font-semibold text-blue-600 dark:text-blue-400">
								{key}:
							</span>
						)}
						<span className="text-purple-600 dark:text-purple-400">
							Array
						</span>
						<span className="text-muted-foreground text-[11px]">
							[{node.length} items]
						</span>
					</div>
					{node.map((item, index) => (
						<div key={index}>
							{renderJSONTree(item, `[${index}]`, level + 1)}
						</div>
					))}
				</div>
			);
		}

		if (typeof node === 'object') {
			const keys = Object.keys(node);
			return (
				<div style={{ paddingLeft: `${indent}px` }}>
					<div className="hover:bg-muted/50 flex items-center gap-1.5 rounded px-1.5 py-0.5">
						{key && (
							<span className="font-semibold text-blue-600 dark:text-blue-400">
								{key}:
							</span>
						)}
						<span className="text-green-600 dark:text-green-400">
							Object
						</span>
						<span className="text-muted-foreground text-[11px]">
							{'{'}
							{keys.length} properties{'}'}
						</span>
					</div>
					{keys.map((objKey) => (
						<div key={objKey}>
							{renderJSONTree(node[objKey], objKey, level + 1)}
						</div>
					))}
				</div>
			);
		}

		return null;
	};

	return (
		<Tabs
			defaultValue="pretty"
			className="flex flex-col h-full min-h-0 overflow-hidden"
		>
			{/* Modern Tab Header */}
			<div className="flex w-full items-center gap-2 sticky top-0 z-10 bg-background py-1.5 select-none border-b border-border/30">
				<TabsList className="h-7 gap-0.5 p-0.5 rounded-lg bg-muted/50">
					<TabsTrigger
						value="pretty"
						className={cn(
							'h-6 px-2.5 gap-1.5 rounded-md text-[10px] font-medium cursor-pointer',
							'data-[state=active]:bg-background data-[state=active]:shadow-sm',
							'data-[state=inactive]:text-muted-foreground',
						)}
					>
						<Sparkles className="size-3" />
						Pretty
					</TabsTrigger>
					<TabsTrigger
						value="raw"
						className={cn(
							'h-6 px-2.5 gap-1.5 rounded-md text-[10px] font-medium cursor-pointer',
							'data-[state=active]:bg-background data-[state=active]:shadow-sm',
							'data-[state=inactive]:text-muted-foreground',
						)}
					>
						<FileCode className="size-3" />
						Raw
					</TabsTrigger>
					<TabsTrigger
						value="preview"
						className={cn(
							'h-6 px-2.5 gap-1.5 rounded-md text-[10px] font-medium cursor-pointer',
							'data-[state=active]:bg-background data-[state=active]:shadow-sm',
							'data-[state=inactive]:text-muted-foreground',
						)}
					>
						<Eye className="size-3" />
						Preview
					</TabsTrigger>
					<TabsTrigger
						value="visualize"
						className={cn(
							'h-6 px-2.5 gap-1.5 rounded-md text-[10px] font-medium cursor-pointer',
							'data-[state=active]:bg-background data-[state=active]:shadow-sm',
							'data-[state=inactive]:text-muted-foreground',
						)}
					>
						<TreeDeciduous className="size-3" />
						Tree
					</TabsTrigger>
				</TabsList>

				{/* Type Selector */}
				<Select
					value={responseType}
					onValueChange={(value) =>
						setResponseType(value as ResponseType)
					}
				>
					<SelectTrigger className="h-7 w-[75px] px-2 text-[10px] border-border/50 bg-transparent hover:bg-muted/50 transition-colors">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-lg shadow-lg">
						<SelectItem
							value="json"
							className="text-xs cursor-pointer"
						>
							JSON
						</SelectItem>
						<SelectItem
							value="xml"
							className="text-xs cursor-pointer"
						>
							XML
						</SelectItem>
						<SelectItem
							value="html"
							className="text-xs cursor-pointer"
						>
							HTML
						</SelectItem>
						<SelectItem
							value="text"
							className="text-xs cursor-pointer"
						>
							Text
						</SelectItem>
					</SelectContent>
				</Select>

				{/* Search Input */}
				<div
					className="flex-1 max-w-[180px] relative group"
					onKeyDown={(e) => {
						if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							contentRef.current?.querySelector('input')?.focus();
						}
					}}
				>
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
					<Input
						placeholder="Search response..."
						value={searchQuery}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleSearch(e.target.value)
						}
						className="h-7 pl-7 pr-7 text-[10px] border-border/50 bg-transparent hover:bg-muted/30 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
					/>
					{searchQuery && (
						<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
							<span className="text-[9px] text-muted-foreground/70 mr-1 font-medium">
								{searchResults.length > 0
									? `${currentMatchIndex + 1}/${searchResults.length}`
									: '0'}
							</span>
							<button
								onClick={() => navigateMatch('prev')}
								className="p-0.5 hover:bg-muted rounded-sm transition-colors"
								disabled={searchResults.length === 0}
							>
								<ChevronUp className="size-3 text-muted-foreground" />
							</button>
							<button
								onClick={() => navigateMatch('next')}
								className="p-0.5 hover:bg-muted rounded-sm transition-colors"
								disabled={searchResults.length === 0}
							>
								<ChevronDown className="size-3 text-muted-foreground" />
							</button>
							<button
								onClick={clearSearch}
								className="p-0.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<X className="size-3" />
							</button>
						</div>
					)}
				</div>

				{/* Download Button */}
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
					onClick={handleDownload}
					title="Download Response"
				>
					<Download className="size-3.5" />
				</Button>
			</div>

			<div
				ref={contentRef}
				className="flex-1 min-h-0 overflow-hidden flex flex-col pt-1"
			>
				<TabsContent
					value="pretty"
					className="flex-1 min-h-0 h-full mt-0 data-[state=active]:flex flex-col"
				>
					{renderPrettyContent()}
				</TabsContent>
				<TabsContent
					value="raw"
					className="flex-1 min-h-0 h-full mt-0 data-[state=active]:flex flex-col"
				>
					{renderRawContent()}
				</TabsContent>
				<TabsContent
					value="preview"
					className="flex-1 min-h-0 h-full mt-0 data-[state=active]:flex flex-col"
				>
					{renderPreviewContent()}
				</TabsContent>
				<TabsContent
					value="visualize"
					className="flex-1 min-h-0 h-full mt-0 data-[state=active]:flex flex-col"
				>
					{renderVisualizeContent()}
				</TabsContent>
			</div>
		</Tabs>
	);
};

export default ResponseBodyTabContent;
