<script lang="ts">
	export let data;
	import {
		TalkingKnowledgeCustom,
		ifStoreMsg,
	} from "$lib/shared/stores/common/Store";
	import { onMount } from "svelte";
	import Scrollbar from "$lib/shared/components/scrollbar/Scrollbar.svelte";
	import {
		LOCAL_STORAGE_KEY,
		MessageRole,
		MessageType,
		type Message,
	} from "$lib/shared/constant/Interface";
	import ChatMessage from "$lib/modules/chat/ChatMessage.svelte";

	import { getCurrentTimeStamp, scrollToBottom } from "$lib/shared/Utils";
	import {
		fetchTextNoStream,
		fetchTextNoStream2,
		fetchTextStream,
	} from "$lib/network/chat/Network";
	import LoadingAnimation from "$lib/shared/components/loading/Loading.svelte";
	import { browser } from "$app/environment";
	// import BadgesRow from "$lib/modules/chat/BadgesRow.svelte";
	import "driver.js/dist/driver.css";
	import "$lib/assets/layout/css/driver.css";
	import UploadFile from "$lib/shared/components/upload/uploadFile.svelte";
	import Previous from "$lib/assets/upload/previous.svelte";
	import Next from "$lib/assets/upload/next.svelte";
	import PaperAirplane from "$lib/assets/chat/svelte/PaperAirplane.svelte";
	import Gallery from "$lib/shared/components/chat/gallery.svelte";

	let query: string = "";
	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;
	// ·········
	let chatMessagesMap1 = data.Msg1?.chatMsg ? data.Msg1.chatMsg : {};
	let items1 = data.Msg1?.chatItems
		? data.Msg1?.chatItems
		: [
				{ id: 1, content: [], time: "0s" },
				{ id: 2, content: [], time: "0s" },
		  ];
	let chatMessagesMap2 = data.Msg2?.chatMsg ? data.Msg2.chatMsg : {};
	let items2 = data.Msg2?.chatItems
		? data.Msg2?.chatItems
		: [
				{ id: 1, content: [], time: "0s" },
				{ id: 2, content: [], time: "0s" },
		  ];
	// ··············
	console.log("data", data);

	$: knowledge = $TalkingKnowledgeCustom[0]
		? $TalkingKnowledgeCustom[0].id
		: "default";

	onMount(async () => {
		scrollToDiv = document
			.querySelector(".chat-scrollbar")
			?.querySelector(".svlr-viewport")!;

		// const storedChatMessagesMap = localStorage.getItem(
		// 	LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY
		// );
		// if (storedChatMessagesMap) {
		// 	chatMessagesMap = JSON.parse(storedChatMessagesMap);
		// 	items.forEach((item) => {
		// 		if (chatMessagesMap[item.id]) {
		// 			item.content = chatMessagesMap[item.id];
		// 		}
		// 	});
		// 	console.log("chatMessagesMap", chatMessagesMap, items);
		// }
	});

	function storeMessages(chatMessagesMap) {
		if ($ifStoreMsg && browser) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY,
				JSON.stringify(chatMessagesMap)
			);
		}
	}

	const callTextNoStream = async (
		query: string,
		id: number,
		chatMessagesMap,
		items,
		group
	) => {
		const startTime = new Date();
		let eventSource;
		// if (group == '1') {
		// 	eventSource = await fetchTextNoStream(query, knowledge, id);
		// } else if (group == '2') {
		// 	eventSource = await fetchTextNoStream2(query, knowledge, id);
		// }

		eventSource = await fetchTextNoStream(query, knowledge, id);

		console.log("group 2", eventSource);

		const endTime = new Date();
		const elapsedTime = (endTime - startTime) / 1000;
		console.log(eventSource.OUTPUT0);

		if (eventSource.OUTPUT0) {
			const newMessage = {
				role: MessageRole.Assistant,
				type: MessageType.Text,
				content: eventSource.OUTPUT0,
				time: getCurrentTimeStamp(),
			};

			const messages = chatMessagesMap[id] || [];
			messages.push(newMessage);
			chatMessagesMap[id] = messages;

			items.forEach((item) => {
				if (item.id === id) {
					item.content = messages;
					item.time = `${elapsedTime}s`;
				}
			});
			items = [...items];

			loading = false;
			storeMessages(chatMessagesMap);
			scrollToBottom(scrollToDiv);
		}

		loading = false;
		storeMessages(chatMessagesMap);
		scrollToBottom(scrollToDiv);
	};

	async function handleSubmit() {
		await Promise.all([
			handleTextSubmit(1, chatMessagesMap1, items1, "1"),
			handleTextSubmit(2, chatMessagesMap1, items1, "1"),
			handleTextSubmit(1, chatMessagesMap2, items2, "2"),
			handleTextSubmit(2, chatMessagesMap2.items2, "2"),
		]);
		query = "";
	}

	const handleTextSubmit = async (
		id: number,
		chatMessagesMap,
		items,
		group
	) => {
		loading = true;
		const newMessage = {
			role: MessageRole.User,
			type: MessageType.Text,
			content: query,
			time: getCurrentTimeStamp(),
		};

		const messages = chatMessagesMap[id] || [];
		messages.push(newMessage);
		chatMessagesMap[id] = messages;

		items.forEach((item) => {
			if (item.id === id) {
				item.content = messages;
			}
		});
		items = [...items];

		console.log(items, chatMessagesMap);

		scrollToBottom(scrollToDiv);
		storeMessages(chatMessagesMap);

		await callTextNoStream(
			newMessage.content,
			id,
			chatMessagesMap,
			items,
			group
		);

		scrollToBottom(scrollToDiv);

		storeMessages(chatMessagesMap);
	};

	function isEmptyObject(obj: any): boolean {
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}
</script>

<!-- <DropZone on:drop={handleImageSubmit}> -->
<div
	class="h-full items-center gap-5 bg-white sm:flex sm:pb-2 lg:rounded-tl-3xl"
>
	<div class="mx-auto flex h-full w-full flex-col sm:mt-0 sm:w-[72%]">
		<div class="flex justify-between p-2">
			<p class="mt-2 text-[1.7rem] font-bold tracking-tight">Neural Chat</p>
			<UploadFile />
		</div>
		<div
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 pb-0"
		>
			<div class="relative my-4 flex w-full flex-row justify-center">
				<div class="foucs:border-none relative w-full">
					<input
						class="text-md block w-full border-0 border-b-2 border-gray-300 p-4 ps-10
						text-gray-900 focus:border-gray-300 focus:ring-0 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
						type="text"
						placeholder="Enter prompt here"
						disabled={loading}
						maxlength="1200"
						bind:value={query}
						on:keydown={(event) => {
							if (event.key === "Enter" && !event.shiftKey && query) {
								event.preventDefault();
								handleSubmit();
							}
						}}
					/>
					<button
						on:click={() => {
							if (query) {
								handleSubmit();
							}
						}}
						type="submit"
						class="absolute bottom-2.5 end-2.5 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
						><PaperAirplane /></button
					>
				</div>
			</div>
		</div>

		<div class="mx-auto mt-4 flex h-full w-full flex-col">
			<div class="flex grid h-full grid-cols-2 flex-col gap-4 divide-x">
				{#if !isEmptyObject(chatMessagesMap1)}
					<div class="flex h-full flex-col rounded border p-2 shadow">
						<!-- gallery -->
						<Gallery items={items1} />
					</div>
				{/if}
				{#if !isEmptyObject(chatMessagesMap2)}
					<div class="flex h-full flex-col rounded border p-2 shadow">
						<!-- gallery -->
						<Gallery items={items2} />
					</div>
				{/if}
			</div>
			{#if loading}
				<LoadingAnimation />
			{/if}
		</div>

		<!-- gallery -->
	</div>
</div>
