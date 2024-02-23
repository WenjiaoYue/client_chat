<script lang="ts">
	export let data;
	import PaperAirplane from "$lib/assets/chat/svelte/PaperAirplane.svelte";
	import {
		CollectionType,
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
	import { fetchTextStream } from "$lib/network/chat/Network";
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

	$: knowledge = knowledgeAccess
		? $currentTemplate.collection === CollectionType.Custom
			? $TemplateCustom[$currentTemplate.id].knowledge
			: TalkingTemplateLibrary[$currentTemplate.id].knowledge
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
			console.log("currentMsg", currentMsg);

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

			await callTextStream(newMessage.content);

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
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 pb-0 shadow-inner"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<!-- Textarea -->
				<div
					class="input-btn focus:ring-link relative flex max-h-60 w-full flex-col items-center rounded-lg border border-gray-300 p-1 focus:border-transparent focus:outline-none focus:ring-1"
				>
					<div class="relative flex w-full flex-row">
						<div class="relative w-[85%]">
							<textarea
								rows="1"
								class="focus:none mx-2 mr-6 inline-block w-full resize-none border-none p-0 text-sm text-gray-600 focus:ring-0"
								placeholder="prompt here"
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
						</div>
					</div>
					<button
						class="absolute bottom-1 right-2"
						on:click={() => {
							if (query) {
								handleTextSubmit();
							}
						}}
						type="submit"
					>
						<PaperAirplane />
					</button>
				</div>
				<!-- hint -->
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
