import { Plus, Trash2, FileUp, FormInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { EnvironmentVariableInput } from '@/components/ui/environment-variable-input';
import { cn } from '@/lib/utils';
import useRequestSyncStoreState from '../../hooks/requestSyncStore';

const FormDataComponent = ({
	type = 'FORM_DATA',
}: {
	type?: 'FORM_DATA' | 'X-WWW-FORM-URLENCODED';
}) => {
	const { activeRequest, updateRequest } = useRequestSyncStoreState();

	const getData = () => {
		if (type === 'FORM_DATA') {
			return Array.isArray(activeRequest?.body?.formData)
				? activeRequest?.body?.formData
				: [];
		}
		return Array.isArray(activeRequest?.body?.urlEncoded)
			? activeRequest?.body?.urlEncoded
			: [];
	};

	const data = getData();
	const listKey = type === 'FORM_DATA' ? 'formData' : 'urlEncoded';
	const isFormData = type === 'FORM_DATA';

	const addField = () => {
		const currentBody = activeRequest?.body || {
			raw: '',
			urlEncoded: [],
			file: null,
			json: {},
			formData: [],
		};

		updateRequest(activeRequest?.id || '', {
			body: {
				...currentBody,
				[listKey]: [
					...(data || []),
					{
						key: '',
						value: '',
						description: '',
						isActive: true,
						type: 'TEXT',
					},
				],
			},
			unsaved: true,
		});
	};

	const updateField = (index: number, field: string, value: any) => {
		const body = {
			...(activeRequest?.body || {
				raw: '',
				urlEncoded: [],
				file: null,
				json: {},
				formData: [],
			}),
		};
		const list = [...(body[listKey] || [])];
		list[index] = { ...list[index], [field]: value };
		body[listKey] = list;

		updateRequest(activeRequest?.id || '', {
			body,
			unsaved: true,
		});
	};

	const removeField = (index: number) => {
		const body = {
			...(activeRequest?.body || {
				raw: '',
				urlEncoded: [],
				file: null,
				json: {},
				formData: [],
			}),
		};
		body[listKey] = body[listKey].filter(
			(_: any, i: number) => i !== index,
		);

		updateRequest(activeRequest?.id || '', {
			body,
			unsaved: true,
		});
	};

	return (
		<div className="flex flex-col gap-2 h-full px-1">
			{/* Empty State */}
			{data.length === 0 && (
				<div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
					<div className="size-14 rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
						<FormInput className="size-6 text-indigo-500/60" />
					</div>
					<div className="text-center space-y-1">
						<p className="text-sm font-semibold text-foreground">
							{isFormData ? 'No form fields' : 'No fields yet'}
						</p>
						<p className="text-xs text-muted-foreground max-w-[240px]">
							{isFormData
								? 'Add key-value pairs for multipart form data'
								: 'Add URL-encoded form fields'}
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={addField}
						className="h-9 text-xs gap-2 rounded-lg mt-1 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40"
					>
						<Plus className="size-3.5" /> Add Field
					</Button>
				</div>
			)}

			{/* Fields List */}
			{data.length > 0 && (
				<>
					{/* Header Row */}
					<div
						className={cn(
							'grid gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600/60 dark:text-indigo-400/60',
							isFormData
								? 'grid-cols-[32px_1fr_1fr_80px_1fr_32px]'
								: 'grid-cols-[32px_1fr_1fr_1fr_32px]',
						)}
					>
						<div></div>
						<div>Key</div>
						<div>Value</div>
						{isFormData && <div>Type</div>}
						<div>Description</div>
						<div></div>
					</div>

					{/* Field Rows */}
					<div className="flex flex-col gap-0.5">
						{data.map((param: any, index: number) => (
							<div
								key={index}
								className={cn(
									'group grid gap-3 px-3 py-1.5 rounded-lg border border-transparent transition-all duration-200 items-center',
									'hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 hover:border-indigo-500/20',
									!param.isActive && 'opacity-50',
									isFormData
										? 'grid-cols-[32px_1fr_1fr_80px_1fr_32px]'
										: 'grid-cols-[32px_1fr_1fr_1fr_32px]',
								)}
							>
								{/* Checkbox */}
								<div className="flex items-center justify-center">
									<Checkbox
										checked={param.isActive}
										onCheckedChange={(checked) =>
											updateField(
												index,
												'isActive',
												Boolean(checked),
											)
										}
										className="size-4 rounded-md data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 shadow-sm"
									/>
								</div>

								{/* Key */}
								<div className="relative">
									<Input
										placeholder="e.g. username"
										value={param.key}
										onChange={(e) =>
											updateField(
												index,
												'key',
												e.target.value,
											)
										}
										className="h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
									/>
								</div>

								{/* Value */}
								<div className="relative">
									{param.type === 'FILE' ? (
										<div className="flex items-center gap-2">
											<label className="flex items-center gap-2 h-8 px-2.5 rounded-md text-xs border border-dashed border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all flex-1">
												<FileUp className="size-3.5 text-indigo-500/60" />
												<span className="text-muted-foreground truncate">
													{param.value ||
														'Choose file...'}
												</span>
												<Input
													type="file"
													className="hidden"
													onChange={(e) => {
														const file =
															e.target.files?.[0];
														updateField(
															index,
															'value',
															file?.name || '',
														);
														updateField(
															index,
															'file',
															file,
														);
													}}
												/>
											</label>
										</div>
									) : (
										<EnvironmentVariableInput
											placeholder="e.g. john_doe or {{user}}"
											value={param.value || ''}
											onChange={(val) =>
												updateField(index, 'value', val)
											}
											className="h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
										/>
									)}
								</div>

								{/* Type Selector (only for FORM_DATA) */}
								{isFormData && (
									<div className="relative">
										<Select
											value={param.type || 'TEXT'}
											onValueChange={(val) =>
												updateField(index, 'type', val)
											}
										>
											<SelectTrigger className="h-8 text-xs border-transparent bg-transparent hover:bg-muted/60 focus:bg-background focus:border-indigo-500/40 px-2 rounded-md transition-all">
												<SelectValue placeholder="Type" />
											</SelectTrigger>
											<SelectContent className="rounded-lg shadow-lg border-indigo-500/20">
												{[
													'TEXT',
													'FILE',
													'NUMBER',
													'BOOLEAN',
												].map((t) => (
													<SelectItem
														key={t}
														value={t}
														className="text-xs cursor-pointer"
													>
														{t.toLowerCase()}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								{/* Description */}
								<div className="relative">
									<Input
										placeholder="e.g. User's login name"
										value={param.description || ''}
										onChange={(e) =>
											updateField(
												index,
												'description',
												e.target.value,
											)
										}
										className="h-8 text-xs text-muted-foreground border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
									/>
								</div>

								{/* Delete */}
								<div className="flex items-center justify-center">
									<Button
										size="icon"
										variant="ghost"
										onClick={() => removeField(index)}
										className="h-7 w-7 rounded-md text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							</div>
						))}
					</div>

					{/* Add Button */}
					<button
						onClick={addField}
						className="flex items-center justify-center gap-2 h-9 text-xs rounded-lg text-muted-foreground/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-border/50 hover:border-indigo-500/40 hover:bg-indigo-500/5 w-full transition-all duration-200"
					>
						<Plus className="size-3.5" /> Add Field
					</button>
				</>
			)}
		</div>
	);
};

export default FormDataComponent;
