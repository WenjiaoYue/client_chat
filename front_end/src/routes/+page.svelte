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

	let query: string = "";
	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;
	// ·········
	let chatMessagesMap = {};
	let chatMessages: Message[] = data.chatMsg ? data.chatMsg : [];
	// ··············

	$: knowledge = $TalkingKnowledgeCustom[0]
		? $TalkingKnowledgeCustom[0].id
		: "default";

	onMount(async () => {
		scrollToDiv = document
			.querySelector(".chat-scrollbar")
			?.querySelector(".svlr-viewport")!;

		const storedChatMessagesMap = localStorage.getItem(
			LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY
		);
		if (storedChatMessagesMap) {
			chatMessagesMap = JSON.parse(storedChatMessagesMap);
			items.forEach((item) => {
				if (chatMessagesMap[item.id]) {
					item.content = chatMessagesMap[item.id];
				}
			});
			console.log("chatMessagesMap", chatMessagesMap, items);
		}
	});

	function storeMessages() {
		if ($ifStoreMsg && browser) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY,
				JSON.stringify(chatMessagesMap)
			);
		}
	}

	const callTextNoStream = async (query: string, id: number) => {
		const startTime = new Date();
		const eventSource = await fetchTextNoStream(query, knowledge);
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
			storeMessages();
			scrollToBottom(scrollToDiv);
		}

		loading = false;
		storeMessages();
		scrollToBottom(scrollToDiv);
	};

	async function handleSubmit() {
		await Promise.all([handleTextSubmit(1), handleTextSubmit(2)]);
		query = "";
	}

	const handleTextSubmit = async (id: number) => {
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
		storeMessages();

		await callTextNoStream(newMessage.content, id);

		scrollToBottom(scrollToDiv);
		storeMessages();
	};

	// gallery
	let currentIndex = 0;
	let items = [
		{ id: 1, content: [], time: "0s" },
		{ id: 2, content: [], time: "0s" },
	];

	function nextItem() {
		currentIndex = (currentIndex + 1) % items.length;
	}

	function prevItem() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
	}

	$: currentItem = items[currentIndex];
	// gallery
</script>

<!-- <DropZone on:drop={handleImageSubmit}> -->
<div
	class="h-full items-center gap-5 bg-white sm:flex sm:pb-2 lg:rounded-tl-3xl"
>
	<div class="mx-auto flex h-full w-full flex-col sm:mt-0 sm:w-[72%]">
		<div class="flex justify-between p-2">
			<p class="mt-2 text-[1.7rem] text-bold">Neural Chat</p>
			<UploadFile />
		</div>
		<div
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 pb-0"
		>
			<div class="relative my-4 flex w-full flex-row justify-center">
				<div class="relative w-[85%]">
					<input
						class="block w-full rounded-lg border-0 border-b-2 border-gray-300 bg-gray-50 p-4 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
						class="absolute bottom-2.5 end-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
						>Send</button
					>
				</div>
			</div>
		</div>

		<!-- gallery -->
		<div
			id="custom-controls-gallery"
			class="relative h-0 w-full w-full grow border px-2 shadow"
			data-carousel="slide"
		>
			<!-- Carousel wrapper -->
			<!-- Display current item -->
			{#if currentItem}
				<Scrollbar
					classLayout="flex flex-col gap-1"
					className="chat-scrollbar h-0 w-full grow px-2 pt-2 mt-3 ml-10"
				>
					{#each currentItem.content as message, i}
						<ChatMessage msg={message} />
					{/each}

					{#if loading}
						<LoadingAnimation />
					{/if}

				</Scrollbar>
				<!-- Loading text -->
				<div class="radius absolute left-0 top-0 bg-white p-2 shadow">
					<!-- Display end to end time -->
					<label for="" class="mr-2 text-base font-bold text-blue-700"
						>End to End Time:
					</label>
					<label for="">{currentItem.time}</label>
				</div>
			{/if}

			<div class="flex items-center justify-between">
				<div class="justify-left ml-2 flex items-center">
					<!-- Previous button -->
					<button
						type="button"
						class="group absolute start-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
						on:click={prevItem}
					>
						<span
							class="text-gray-400 hover:text-gray-900 group-focus:text-gray-900 dark:hover:text-white dark:group-focus:text-white"
						>
							<Previous />
							<span class="sr-only">Previous</span>
						</span>
					</button>
					<!-- Next button -->

					<button
						type="button"
						class="group absolute end-0 top-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
						on:click={nextItem}
					>
						<span
							class="text-gray-400 hover:text-gray-900 group-focus:text-gray-900 dark:hover:text-white dark:group-focus:text-white"
						>
							<Next />
							<span class="sr-only">Next</span>
						</span>
					</button>
				</div>
			</div>
		</div>
		<!-- gallery -->
	</div>
</div>

<style>
	.row::-webkit-scrollbar {
		display: none;
	}

	.row {
		scrollbar-width: none;
	}

	.row {
		-ms-overflow-style: none;
	}
</style>
