import { browser } from '$app/environment';
import { LOCAL_STORAGE_KEY } from '$lib/shared/constant/Interface';

export const load = async () => {
  if (browser) {
    const chat = localStorage.getItem(LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY);
    const items = [
      { id: 1, content: [], time: "0s" },
      { id: 2, content: [], time: "0s" },
    ];
		if (chat) {
			const chatMessagesMap = JSON.parse(chat);
			items.forEach((item) => {
				if (chatMessagesMap[item.id]) {
					item.content = chatMessagesMap[item.id];
				}
			});
			console.log("chatMessagesMap", chatMessagesMap, items);
		}
    return {
      chatMsg: JSON.parse(chat || '[]')
    }
  }
};
