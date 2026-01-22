import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconSend } from '@tabler/icons-react';

interface MessageEditorProps {
	value: string;
	onChange: (value: string) => void;
	onSend: () => void;
	disabled?: boolean;
	placeholder?: string;
}

const MessageEditor: React.FC<MessageEditorProps> = ({
	value,
	onChange,
	onSend,
	disabled,
	placeholder = 'Compose message...',
}) => {
	return (
		<div className="flex flex-col gap-2 h-full">
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="flex-1 font-mono resize-none p-4"
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						onSend();
					}
				}}
			/>
			<div className="flex justify-end">
				<Button
					onClick={onSend}
					disabled={disabled || !value?.trim()}
					className="w-24"
				>
					<IconSend className="mr-2 size-4" />
					Send
				</Button>
			</div>
		</div>
	);
};

export default MessageEditor;
