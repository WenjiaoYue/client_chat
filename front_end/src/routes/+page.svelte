<script lang="ts">
	export let data;
	import ChatMessage from "$lib/modules/chat/ChatMessage.svelte";
	import PaperAirplane from "$lib/assets/chat/svelte/PaperAirplane.svelte";
	import Close from "$lib/assets/chat/svelte/Close.svelte";
	import ImageIcon from "$lib/assets/chat/svelte/ImageIcon.svelte";

	import DropZone from "$lib/shared/components/drag-drop/DropZone.svelte";
	import ChatResponse from "$lib/network/chat/ChatResponse";
	import LoadingButtonSpinnerIcon from "$lib/assets/chat/svelte/LoadingButtonSpinnerIcon.svelte";
	import {
	CollectionType,
		TalkingKnowledgeCustom,
		TalkingVoiceCustom,
		countDown,
		currentKnowledge,
		currentVoice,
		ifStoreMsg,
		imageList,
		isLoading,
	} from "$lib/shared/stores/common/Store";
	import { Badge, Button, Checkbox, Progressbar } from "flowbite-svelte";
	import { onMount } from "svelte";
	import { fetchImageList } from "$lib/network/image/Network";
	import Scrollbar from "$lib/shared/components/scrollbar/Scrollbar.svelte";
	import {
		LOCAL_STORAGE_KEY,
		MessageRole,
		MessageType,
		type Message,
		isImage,
	} from "$lib/shared/constant/Interface";
	import {
		fromTimeStampToTime,
		getCurrentTimeStamp,
		scrollToBottom,
	} from "$lib/shared/Utils";
	import ChatImageCard from "$lib/modules/chat/ChatImageCard.svelte";
	import ArrowRight from "$lib/assets/chat/svelte/ArrowRight.svelte";
	import { fetchAudioStream, fetchAudioText } from "$lib/network/chat/Network";
	import VoiceButton from "$lib/shared/components/talkbot/VoiceButton.svelte";
	import LoadingAnimation from "$lib/shared/components/loading/Loading.svelte";
	import { browser } from "$app/environment";
	// import BadgesRow from "$lib/modules/chat/BadgesRow.svelte";
	import { driver } from "driver.js";
	import "driver.js/dist/driver.css";
	import "$lib/assets/layout/css/driver.css";
	import {
		checkProcessingImage,
		getTypeList,
	} from "$lib/network/image/getTypeLists.js";
	import Add from "$lib/assets/chat/svelte/Add.svelte";
	import ChatToolsCard from "$lib/modules/chat/ChatToolsCard.svelte";
	import ChatVideoCard from "$lib/modules/chat/ChatVideoCard.svelte";
	import { TalkingVoiceLibrary } from "$lib/shared/constant/Data.js";

	let query: string = "";

	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;
	let done: boolean = false;
	let uploadProgress = 0;
	let uploadHandle: number;
	let typeList: { [index: string]: { [index: string]: string } } = {};
	let promptList: { [key: string]: any[] } = {};
	let showBottomImages = false;
	let showBottomPrompt = false;
	let showTools = false;
	let toolTile = "";
	let uploadedImageToVideo = false

	let chatMessages: Message[] = data.chatMsg ? data.chatMsg : [];
	let prompts = {
		"Image Style": ["simple drawing", "van gogh", "stone sculpture"],
	};
	let group: string[] = [];
	const voice = ($currentVoice.collection === CollectionType.Custom ? $TalkingVoiceCustom[$currentVoice.id].id 
					: ($currentVoice.collection === CollectionType.Library ? TalkingVoiceLibrary[$currentVoice.id].identify : "default")
					)
	const knowledge = ($currentKnowledge.collection === CollectionType.Custom ?
					$TalkingKnowledgeCustom[$currentKnowledge.id].id : 'default')

	$: placeholder =
		chatMessages.length &&
		chatMessages[chatMessages.length - 1].role === MessageRole.User &&
		isImage(chatMessages[chatMessages.length - 1].type)
			? "Ask me about..."
			: "Upload images/Ask me about...";
	$: currentDragImageList = new Array($imageList.length).fill(false);

	$: {
		if (group.length > 0) {
			query = generateQuery(group);
		} 
	}

	function handelCloseTool() {
		console.log("coming");

		showTools = !showTools;
		toolTile = "";
	}

	function handelShowTool(e: any) {
		toolTile = e.detail;
		showBottomImages = false;
		showTools = false;
	}
	function generateQuery(selectedItems: string[]) {
		return `Give me photos taken in ${selectedItems.join(", ")}`;
	}
	const fullPromptMap = (word: string) =>
		({
			"Image Style": `Covert to ${word} style`,
			Time: `Give me photos taken on ${word}`,
			Person: `Give me ${word}'s photos`,
		} as { [index: string]: string });

	onMount(async () => {
		scrollToDiv = document
			.querySelector(".chat-scrollbar")
			?.querySelector(".svlr-viewport")!;

		[done, typeList, promptList] = await checkProcessingImage();
		console.log("typeList", typeList);

		if (!done) {
			setTimeout(async () => {
				await checkProcessingImage(), 500;
			});
		}

		const capitalizedKeys = Object.entries(promptList)
			.filter(([_, value]) => value.length > 0)
			.map(([key, value]) => ({
				[key.charAt(0).toUpperCase() + key.slice(1)]: value,
			}))
			.reduce((acc, item) => ({ ...acc, ...item }), {});

		prompts = { ...prompts, ...capitalizedKeys };
		const res = await fetchImageList();
		if (res) imageList.set(res);

		const driverObj = driver({
			showProgress: true,
			allowClose: true,
			overlayOpacity: 0,
			popoverClass: "driverjs-theme",
			nextBtnText: ">",
			prevBtnText: "<",
			doneBtnText: "X",
			steps: [
				{
					element: ".image-btn",
					popover: { title: "Image", description: "Upload your images" },
				},
				{
					element: ".nav-btn",
					popover: {
						title: "Click to photo",
						description: "Edit your photo info",
					},
				},
				{
					element: ".input-btn",
					popover: {
						title: "Talking & Chat",
						description: "Talking with your photos",
					},
				},
				{
					element: ".hint-btn",
					popover: { title: "Hint", description: "Use hint examples " },
				},
			],
		});
		console.log($countDown);

		// Only triggers the first time
		// if ($countDown >= 1790 && window.deviceType === "mobile") {
		// 	window.name = "loaded";
		// 	driverObj.drive();
		// }
	});

	function storeMessages() {
		if ($ifStoreMsg && browser) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY,
				JSON.stringify(chatMessages)
			);
		}
	}

	function handleImageSubmit(e: CustomEvent) {
		const newMessage = {
			role: MessageRole.User,
			type: MessageType.SingleImage,
			content: { imgId: e.detail.id, imgSrc: e.detail.src },
			time: getCurrentTimeStamp(),
		};
		chatMessages = [...chatMessages, newMessage];
		scrollToBottom(scrollToDiv);
		storeMessages();
	}

	function handleImageListSubmit() {
		const checkedItems = $imageList.filter((_, i) => currentDragImageList[i]);

		const newMessage = {
			role: MessageRole.User,
			type: MessageType.ImageList,
			content: checkedItems.map((image) => ({
				imgSrc: image.image_path,
				imgId: image.image_id,
			})),
			time: getCurrentTimeStamp(),
		};

		chatMessages = [...chatMessages, newMessage];
		scrollToBottom(scrollToDiv);
		storeMessages();
	}

	const callGeneralMsg = async (query: string) => {
		// split imageList
		let i = chatMessages.length - 2
		for (; i >= 0; i--) {
			if (!(chatMessages[i].role === MessageRole.User && isImage(chatMessages[i].type))) break;
		}

		type img = {imgSrc: string;imgId: string;}
		let imageListBetween: img[] = []
		for (let item of chatMessages.slice(i + 1, chatMessages.length - 1)) {
			if (item.type === MessageType.SingleImage) imageListBetween = [...imageListBetween, item.content as img]
			else imageListBetween = [...imageListBetween, ...(item.content as img[])]
		}

		// network
		let res = await ChatResponse.chatMessage(query, voice, knowledge, imageListBetween, uploadedImageToVideo);
		if (res) {
			let type = MessageType.Text;
			if (typeof res === "object" && res.type === "video") {
				type = MessageType.singleVideo;
				res = res.url
			}
			if (Array.isArray(res)) {
				if (res.length === 1) {
					res = res[0];
					type = MessageType.SingleImage;
				} else {
					type = MessageType.ImageList;
				}
			}
			chatMessages = [
				...chatMessages,
				{
					role: MessageRole.Assistant,
					type,
					content: res,
					time: getCurrentTimeStamp(),
				},
			];
		}
	}

	const callAudioStream = async (query: string) => {
		const eventSource = await fetchAudioStream(
			query,
			voice,
			knowledge
		);

		eventSource.addEventListener("message", (e: any) => {
			loading = false;
			let currentMsg = e.data;
			if (currentMsg.startsWith("b'")) {
				const audioUrl = "data:audio/wav;base64," + currentMsg.slice(2, -1);

				if (chatMessages[chatMessages.length - 1].role == MessageRole.User) {
					chatMessages = [
						...chatMessages,
						{
							role: MessageRole.Assistant,
							type: MessageType.AudioList,
							content: [audioUrl],
							time: getCurrentTimeStamp(),
						},
					];
				} else {
					let content = chatMessages[chatMessages.length - 1]
						.content as string[];
					chatMessages[chatMessages.length - 1].content = [
						...content,
						audioUrl,
					];
				}

				scrollToBottom(scrollToDiv);
			} else if (currentMsg === "[DONE]") {
				let content = chatMessages[chatMessages.length - 1]
					.content as string[];
				chatMessages[chatMessages.length - 1].content = [...content, "done"];
				storeMessages();
			}
		});
		eventSource.stream();
	}
	const handleTextSubmit = async () => {
		loading = true;
		showBottomPrompt = false;
		showBottomImages = false;
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

		await callGeneralMsg(newMessage.content)

		scrollToBottom(scrollToDiv);
		storeMessages();
		loading = false;
		uploadedImageToVideo = false;
	};

	const handleAudioSubmit = (audioBlob: Blob) => {
		loading = true;
		let fileReader = new FileReader();
		fileReader.onloadend = async () => {
			let readerRes = (fileReader.result as string).split(";");

			chatMessages = [
				...chatMessages,
				{
					role: MessageRole.User,
					type: MessageType.SingleAudio,
					content: readerRes[0] + ";" + readerRes[2],
					time: getCurrentTimeStamp(),
				},
			];
			scrollToBottom(scrollToDiv);
			storeMessages();

			const res = await fetchAudioText(audioBlob);
			if (uploadedImageToVideo) {
				await callGeneralMsg(res.asr_result)
				uploadedImageToVideo = false;
			} else {
				await callAudioStream(res.asr_result)
			}
		};
		fileReader.readAsDataURL(audioBlob);
	};

	function handleVideoSubmit(idx: number) {
		const checkedItem = $imageList[idx]

		const newMessage = {
			role: MessageRole.User,
			type: MessageType.SingleImage,
			content: {
				imgSrc: checkedItem.image_path,
				imgId: checkedItem.image_id,
			},
			time: getCurrentTimeStamp(),
		};

		console.log('newMessage', newMessage);
		

		chatMessages = [...chatMessages, newMessage];
		scrollToBottom(scrollToDiv);
		storeMessages();

		uploadedImageToVideo = true
	}

	function handleUploadBegin() {
		uploadHandle = setInterval(() => {
			if (uploadProgress < 70) uploadProgress += 5;
			else if (uploadProgress < 90) uploadProgress += 2;
			else if (uploadProgress < 99) uploadProgress += 1;
		}, 500);
	}

	function handleUploadEnd() {
		uploadProgress = 0;
		clearInterval(uploadHandle);
	}
</script>

<DropZone on:drop={handleImageSubmit}>
	<div class="h-full items-center gap-5 sm:flex sm:px-20 sm:pb-2">
		<div class="mx-auto flex h-full w-full flex-col sm:mt-0 sm:w-2/3">
			<Scrollbar
				classLayout="flex flex-col gap-1"
				className="chat-scrollbar h-0 w-full grow px-2 pt-2 mt-3"
			>
				<!-- Upload Your Images, Let’s talking with them! 🎉 -->
				<!-- <ChatMessage
					msg={{
						role: MessageRole.Assistant,
						content: "",
						type: MessageType.Text,
						time: 0,
					}}
				/> -->
				{#each chatMessages as message, i}
					<ChatMessage
						msg={message}
						time={i === 0 || message.time - chatMessages[i - 1].time > 60
							? fromTimeStampToTime(message.time)
							: ""}
					/>
				{/each}
			</Scrollbar>
			<!-- Loading text -->
			{#if loading}
				<LoadingAnimation />
			{/if}

			{#if $isLoading}
				<span class="mb-2 ml-4 text-sm text-gray-500"
					>Uploading, please wait...</span
				>
			{/if}

			<div
				class="fixed relative z-40 flex w-full flex-col items-center justify-between bg-white p-2 shadow-inner"
			>
				{#if uploadProgress}
					<Progressbar
						progress={uploadProgress.toString()}
						size="h-1"
						color="blue"
						class="mb-2"
					/>
				{/if}
				<div
					class="flex w-full flex-row items-center justify-between gap-3 pt-2"
				>
					<!-- Textarea -->
					<div
						class="input-btn focus:ring-link relative flex max-h-60 w-full flex-row items-center rounded-lg border border-gray-300 p-1 focus:border-transparent focus:outline-none focus:ring-1"
					>
						<VoiceButton
							on:done={(e) => {
								handleAudioSubmit(e.detail);
							}}
						/>
						<textarea
							rows="2"
							class="focus:none inline-block w-full resize-none border-none p-0 mx-2 mr-6 text-sm text-gray-600 focus:ring-0 placeholder:translate-y-2"
							{placeholder}
							disabled={loading}
							maxlength="1200"
							bind:value={query}
							on:keydown={(event) => {
								if (event.key === "Enter" && !event.shiftKey && query) {
									event.preventDefault();
									handleTextSubmit(false);
								}
							}}
						/>
						<button
							class="absolute bottom-3 right-1"
							on:click={() => {
								if (query) {
									handleTextSubmit(false);
								}
							}}
							type="submit"
						>
							<PaperAirplane />
						</button>
					</div>
					<!-- image -->
					<button
						class="image-btn h-full sm:hidden"
						on:click={() => {
							showBottomImages = !showBottomImages;
							showTools = false;
							toolTile = "";
						}}
					>
						<ImageIcon extraClass={showBottomImages ? "hidden" : ""} />
						<ArrowRight
							extraClass={`${
								!showBottomImages ? "hidden" : ""
							} w-5 h-5 rotate-90`}
						/>
					</button>

					<!-- tools -->
					<button
						class="image-btn h-full"
						on:click={() => {
							showBottomImages = false;
							showTools = !showTools;
							toolTile = "";
						}}
					>
						<Add extraClass={showTools ? "hidden" : ""} />
						<ArrowRight
							extraClass={`${!showTools ? "hidden" : ""} w-5 h-5 rotate-90`}
						/>
					</button>
					<!-- hint -->
					<!-- <button
						class="hint-btn"
						on:click={() => {
							showBottomPrompt = !showBottomPrompt;
							showBottomImages = false;
						}}
					>
						<HintIcon extraClass={showBottomPrompt ? "hidden" : ""} />
						<ArrowRight
							extraClass={`${
								!showBottomPrompt ? "hidden" : ""
							} w-5 h-5 rotate-90`}
						/>
					</button> -->
				</div>
				<!-- under moible mode -->
				{#if showBottomImages}
					<ChatImageCard
						extraClass="sm:hidden"
						on:clickSend={handleImageListSubmit}
						on:clickImage={(e) => {
							const idx = e.detail;
							currentDragImageList[idx] = !currentDragImageList[idx];
						}}
						on:uploadBegin={handleUploadBegin}
						on:uploadEnd={handleUploadEnd}
					/>
				{/if}

				{#if showTools}
					<ChatToolsCard  on:showTool={handelShowTool} />
				{/if}
				{#if toolTile === "Hint"}
					<div class="relative w-full">
						<button
							class="absolute right-0 top-0 z-[500] rounded-full bg-[#eeeeeec7] p-1"
							on:click={handelCloseTool}><Close /></button
						>
						<Scrollbar className="max-h-44 pb-2 w-full mt-2" classLayout="">
							{#each Object.entries(prompts) as [k, v]}
								<p class="text-sm font-semibold text-[#15325f]">{k}</p>

								{#if k === "Address"}
									<div class="flex max-h-20 flex-wrap overflow-auto pl-2">
										{#each v as badge}
											<Checkbox class="mr-2" bind:group value={badge}>
												<Badge
													color="blue"
													class="mb-2 mt-1 inline-block w-full whitespace-nowrap border-[#000] py-1 outline-[#000]"
												>
													{badge}
												</Badge>
											</Checkbox>
										{/each}
									</div>
								{:else}
									{#each v as badge}
										<button
											class="mr-2"
											on:click={() => {
												query = fullPromptMap(badge)[k];
											}}
										>
											<Badge
												color="blue"
												class="mb-2 mt-1 inline-block w-full whitespace-nowrap border-[#000] py-1 outline-[#000]"
											>
												{badge}
											</Badge>
										</button>
									{/each}
								{/if}
							{/each}
						</Scrollbar>
					</div>
				{:else if toolTile === "Video"}
					<ChatVideoCard
						on:closeTool={handelCloseTool}
						on:clickVideoImage={(e) => handleVideoSubmit(e.detail)}
					/>
				{/if}
			</div>
		</div>
		<ChatImageCard
			extraClass="max-sm:hidden"
			on:clickSend={handleImageListSubmit}
			on:clickImage={(e) => {
				const idx = e.detail;
				currentDragImageList[idx] = !currentDragImageList[idx];
			}}
			on:uploadBegin={handleUploadBegin}
			on:uploadEnd={handleUploadEnd}
		/>
	</div>
</DropZone>

<style>
</style>
