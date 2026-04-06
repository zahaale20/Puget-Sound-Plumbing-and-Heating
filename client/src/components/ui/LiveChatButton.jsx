import { FaComments } from "react-icons/fa";

import { isLiveChatEnabled, openLiveChat } from "../../services/liveChat";

export default function LiveChatButton({ className = "", label = "Live Chat", onAfterClick }) {
	if (!isLiveChatEnabled()) return null;

	return (
		<button
			type="button"
			onClick={() => {
				openLiveChat();
				onAfterClick?.();
			}}
			className={className}
			aria-label="Open live chat"
		>
			<FaComments />
			{label}
		</button>
	);
}