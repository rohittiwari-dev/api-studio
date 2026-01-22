import { cn } from '@/lib/utils';
import { HttpMethod } from '@/generated/prisma/browser';
import { requestTextColorMap } from '@/lib/utils';

const MethodBadge = ({ method }: { method?: HttpMethod }) => {
	const displayMethod = method || 'GET';
	return (
		<span
			className={cn(
				'px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide',
				'bg-current/10',
				requestTextColorMap[displayMethod],
			)}
		>
			{displayMethod?.substring(0, 3)}
		</span>
	);
};

export default MethodBadge;
