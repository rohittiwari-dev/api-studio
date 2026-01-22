import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const WorkspaceInvite = () => {
	return (
		<div className="flex -space-x-2 *:data-[slot=avatar]:grayscale *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
			<Avatar>
				<AvatarImage
					src="https://github.com/shadcn.png"
					alt="@shadcn"
				/>
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage
					src="https://github.com/leerob.png"
					alt="@leerob"
				/>
				<AvatarFallback>LR</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarImage
					src="https://github.com/evilrabbit.png"
					alt="@evilrabbit"
				/>
				<AvatarFallback>ER</AvatarFallback>
			</Avatar>
		</div>
	);
};

export default WorkspaceInvite;
