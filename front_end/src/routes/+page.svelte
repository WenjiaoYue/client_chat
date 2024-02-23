<script lang="ts">
	export let data;
	import PaperAirplane from "$lib/assets/chat/svelte/PaperAirplane.svelte";
	import {
		CollectionType,
		TalkingKnowledgeCustom,
		TemplateCustom,
		currentMode,
		currentTemplate,
		ifStoreMsg,
		imageList,
		photoMode,
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
	import { TalkingTemplateLibrary } from "$lib/shared/constant/Data.js";
	import { getNotificationsContext } from "svelte-notifications";
	import UploadFile from "$lib/shared/components/upload/uploadFile.svelte";

	let query: string = "";
	const { addNotification } = getNotificationsContext();
	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;

	let chatMessages: Message[] = data.chatMsg ? data.chatMsg : [];

	let knowledgeAccess = true;

	console.log("222", $TalkingKnowledgeCustom);

	$: knowledge = $TalkingKnowledgeCustom[0]
		? $TalkingKnowledgeCustom[0].id
		: "default";

	onMount(async () => {
		scrollToDiv = document
			.querySelector(".chat-scrollbar")
			?.querySelector(".svlr-viewport")!;
	});

	function storeMessages() {
		if ($ifStoreMsg && browser) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY,
				JSON.stringify(chatMessages)
			);
		}
	}

	const callTextStream = async (query: string) => {
		const eventSource = await fetchTextStream(query, knowledge);

		eventSource.addEventListener("message", (e: any) => {
			let currentMsg = e.data;
			console.log("currentMsg", currentMsg, chatMessages);

			if (currentMsg == "[DONE]") {
				loading = false;
				storeMessages();
			} else {
				if (chatMessages[chatMessages.length - 1].role == MessageRole.User) {
					chatMessages = [
						...chatMessages,
						{
							role: MessageRole.Assistant,
							type: MessageType.Text,
							content: currentMsg,
							time: getCurrentTimeStamp(),
						},
					];
				} else {
					let content = chatMessages[chatMessages.length - 1].content as string;
					chatMessages[chatMessages.length - 1].content =
						content + " " + currentMsg;
				}
				scrollToBottom(scrollToDiv);
			}
		});
		eventSource.stream();
	};

	const callTextNoStream = async (query: string) => {
		const eventSource = await fetchTextNoStream(query, knowledge);
		console.log("eventSource", eventSource.OUTPUT0, chatMessages, knowledge);

		if (eventSource.OUTPUT0) {
			chatMessages = [
				...chatMessages,
				{
					role: MessageRole.Assistant,
					type: MessageType.Text,
					content: eventSource.OUTPUT0,
					time: getCurrentTimeStamp(),
				},
			];
		}

		loading = false;
		storeMessages();
		scrollToBottom(scrollToDiv);
	};

	async function warningUser() {
		const checkedItems = $imageList
			.filter((_, i) => currentDragImageList[i])
			.map((item) => ({
				imgSrc: item.image_path,
				imgId: item.image_id,
			}));
		if ($currentMode === "Text") {
			return true;
		} else if ($currentMode === "Video" && checkedItems.length !== 1) {
			addNotification({
				text: "Please select one photo!",
				position: "bottom-center",
				type: "warning",
				removeAfter: 3000,
			});
			return false;
		} else if ($photoMode === "styleTransfer" && checkedItems.length === 0) {
			addNotification({
				text: "Please select photos!",
				position: "bottom-center",
				type: "warning",
				removeAfter: 3000,
			});
			return false;
		} else if ($photoMode === "photoChat" && $imageList.length === 0) {
			addNotification({
				text: "Please upload photos!",
				position: "bottom-center",
				type: "warning",
				removeAfter: 3000,
			});
			return false;
		} else {
			return true;
		}
	}

	const handleTextSubmit = async () => {
		const res = await warningUser();

		if (res) {
			loading = true;
			const newMessage = {
				role: MessageRole.User,
				type: MessageType.Text,
				content: query,
				time: getCurrentTimeStamp(),
			};
			chatMessages = [...chatMessages, newMessage];
			scrollToBottom(scrollToDiv);
			storeMessages();
			query = "";

			await callTextNoStream(newMessage.content);

			scrollToBottom(scrollToDiv);
			storeMessages();
		}
	};
</script>

<!-- <DropZone on:drop={handleImageSubmit}> -->
<div
	class="h-full items-center gap-5 bg-white sm:flex sm:pb-2 lg:rounded-tl-3xl"
>
	<div class="mx-auto flex h-full w-full flex-col sm:mt-0 sm:w-[72%]">
		<div class="flex justify-between p-2">
			<p class="mt-2 tracking-tight sm:text-4xl">Neural Chat</p>
			<UploadFile />
		</div>
		<div
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 pb-0 "
		>
		<div class="relative flex w-full flex-row justify-center my-4">
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
							handleTextSubmit();
						}
					}}
				/>
				<button
					on:click={() => {
						if (query) {
							handleTextSubmit();
						}
					}}
					type="submit"
					class="absolute bottom-2.5 end-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
					>Send</button
				>
			</div>
		</div>
		</div>
		<Scrollbar
			classLayout="flex flex-col gap-1"
			className="chat-scrollbar h-0 w-full grow px-2 pt-2 mt-3"
		>
			{#each chatMessages as message, i}
				<ChatMessage msg={message} />
			{/each}
		</Scrollbar>
		<!-- Loading text -->
		{#if loading}
			<LoadingAnimation />
		{/if}
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
