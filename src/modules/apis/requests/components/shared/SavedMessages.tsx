import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { createId } from '@paralleldrive/cuid2';
import useRequestSyncStoreState from '../../hooks/requestSyncStore';

interface SavedMessagesProps {
	requestId: string;
	onSelect: (message: any) => void;
	type: 'WEBSOCKET' | 'SOCKET_IO';
	currentMessage?: {
		content: string;
		eventName?: string;
		args?: string;
		ack?: boolean;
	};
}

const SavedMessages: React.FC<SavedMessagesProps> = ({
	requestId,
	onSelect,
	type,
	currentMessage,
}) => {
	const { getRequestById, updateRequest } = useRequestSyncStoreState();
	const request = getRequestById(requestId);
	const savedMessages = request?.savedMessages || [];

	const handleSave = () => {
		if (!currentMessage?.content && !currentMessage?.eventName) {
			return;
		}

		const newMessage = {
			id: createId(),
			content: currentMessage.content || '',
			eventName: currentMessage.eventName,
			args: currentMessage.args,
			ack: currentMessage.ack,
		};

		updateRequest(requestId, {
			savedMessages: [...savedMessages, newMessage],
		});
	};

	const handleDelete = (id: string) => {
		updateRequest(requestId, {
			savedMessages: savedMessages.filter((m) => m.id !== id),
		});
	};

	return (
		<div className="flex flex-col h-full border-l bg-muted/10 w-64">
			<div className="flex items-center justify-between p-2 border-b">
				<span className="text-xs font-semibold text-muted-foreground">
					Saved Messages
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={handleSave}
				>
					<IconPlus className="size-4" />
				</Button>
			</div>
			<ScrollArea className="flex-1">
				<div className="flex flex-col">
					{savedMessages.map((msg) => (
						<div
							key={msg.id}
							className="group flex items-center justify-between p-2 hover:bg-muted/50 cursor-pointer border-b border-dashed"
							onClick={() => onSelect(msg)}
						>
							<div className="flex flex-col overflow-hidden">
								{type === 'SOCKET_IO' && msg.eventName && (
									<span className="text-xs font-bold truncate text-primary">
										{msg.eventName}
									</span>
								)}
								<span className="text-xs truncate opacity-70">
									{msg.content || msg.args || '(Empty)'}
								</span>
							</div>
							<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-red-500 hover:text-red-600"
									onClick={(e) => {
										e.stopPropagation();
										handleDelete(msg.id);
									}}
								>
									<IconTrash className="size-3" />
								</Button>
							</div>
						</div>
					))}
					{savedMessages.length === 0 && (
						<div className="p-4 text-center text-xs text-muted-foreground">
							No saved messages
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
};

export default SavedMessages;
