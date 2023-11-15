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
		TemplateCustom,
		countDown,
		currentMode,
		currentTemplate,
		ifStoreMsg,
		imageList,
		isLoading,
		photoMode,
		showSidePage,
		videoMode,
	} from "$lib/shared/stores/common/Store";
	import {
		Badge,
		Button,
		Checkbox,
		Indicator,
		Modal,
		Progressbar,
	} from "flowbite-svelte";
	import { onMount } from "svelte";
	import { fetchImageList, fetchTypeList } from "$lib/network/image/Network";
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
	import {
		fetchAudioStream,
		fetchAudioText,
		fetchTextStream,
	} from "$lib/network/chat/Network";
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
	import {
		TalkingTemplateLibrary,
		TalkingVoiceLibrary,
	} from "$lib/shared/constant/Data.js";
	import HintIcon from "$lib/assets/chat/svelte/HintIcon.svelte";
	import UploadImageBlobs from "$lib/shared/components/upload/UploadImageBlobs.svelte";
	import ChatUploadImages from "$lib/modules/chat/ChatUploadImages.svelte";
	import ColorImg from "$lib/assets/chat/svelte/ColorImg.svelte";
	import ToolList from "$lib/modules/chat/ToolList.svelte";
	import PictureEnlarge from "$lib/shared/components/images/PictureEnlarge.svelte";
	import PopImageList from "$lib/modules/chat/popImageList.svelte";
	import Notification from "$lib/assets/image-info/svelte/notification.svelte";
	import { getNotificationsContext } from "svelte-notifications";
	import KnowledgeAccess from "$lib/modules/chat/KnowledgeAccessPage.svelte";
	import KnowledgeAccessPage from "$lib/modules/chat/KnowledgeAccessPage.svelte";

	let query: string = "";
	const { addNotification } = getNotificationsContext();
	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;
	let done: boolean = false;
	let typeList: { [index: string]: { [index: string]: string } } = {};
	let promptList: { [key: string]: any[] } = {};
	let showBottomImages = false;
	let showBottomPrompt = false;
	let showTools = false;
	let toolTile = "";
	let uploadedImageToVideo = false;

	let chatMessages: Message[] = data.chatMsg ? data.chatMsg : [];
	let prompts = {
		"Image Style": [
			"pencil sketch",
			"disney cartoon",
			"add fireworks",
			"van gogh",
			"pixar",
			"younger",
		],
	};
	let group: string[] = [];
	let knowledgeAccess = true;

	$: voice =
		$currentTemplate.collection === CollectionType.Custom
			? $TemplateCustom[$currentTemplate.id].identify
			: TalkingTemplateLibrary[$currentTemplate.id].identify;

	$: knowledge = knowledgeAccess
		? $currentTemplate.collection === CollectionType.Custom
			? $TemplateCustom[$currentTemplate.id].knowledge
			: TalkingTemplateLibrary[$currentTemplate.id].knowledge
		: "default";

	let showFloatImg = false;

	$: placeholder =
		$currentMode === "Text"
			? "Message chatbot ..."
			: $currentMode === "Search"
			? "Pick up your photos based on time/location/ ..."
			: $currentMode === "Photo"
			? "Stylize your Photos ..."
			: $currentMode === "Video" && $videoMode === "input"
			? "Create talking avatar from your text/voice ..."
			: "Chat with Avatar from your text/voice ...";

	$: currentDragImageList = new Array($imageList.length).fill(false);

	$: $currentMode !== "Photo" ? (showFloatImg = true) : (showFloatImg = false);
	console.log("$currentMode", $currentMode);

	$: {
		if (group.length > 0) {
			query = generateQuery(group);
		}
	}

	function refreshImages(idx: number, imgSrc: string) {
		$imageList[idx].image_path =
			"https://img.zcool.cn/community/0131565aeff3c5a801219b7f6906a7.gif";

		setTimeout(function () {
			$imageList[idx].image_path = imgSrc;
		}, 2000);
	}

	function handelCloseTool() {
		currentMode.set("Text");
		showBottomImages = false;
	}

	function generateQuery(selectedItems: string[]) {
		return `Give me photos taken in ${selectedItems.join(", ")}`;
	}

	const fullPromptMap = (word: string) =>
		({
			"Image Style": `Convert the image into ${word} rendition`,
			Time: `Give me photos taken on ${word}`,
			Person: `Give me ${word}'s photos`,
		} as { [index: string]: string });

	async function getPrompt() {
		[done, typeList, promptList] = await checkProcessingImage();

		const capitalizedKeys = Object.entries(promptList)
			.filter(([_, value]) => value.length > 0)
			.map(([key, value]) => ({
				[key.charAt(0).toUpperCase() + key.slice(1)]: value,
			}))
			.reduce((acc, item) => ({ ...acc, ...item }), {});
		prompts = {...prompts, ...capitalizedKeys};		
	}
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
	});

	function storeMessages() {
		if ($ifStoreMsg && browser) {
			localStorage.setItem(
				LOCAL_STORAGE_KEY.STORAGE_CHAT_KEY,
				JSON.stringify(chatMessages)
			);
		}
	}

	const callGeneralMsg = async (query: string) => {
		const checkedItems = $imageList
			.filter((_, i) => currentDragImageList[i])
			.map((item) => ({
				imgSrc: item.image_path,
				imgId: item.image_id,
			}));
		// network
		let res = await ChatResponse.chatMessage(
			query,
			voice,
			knowledge,
			checkedItems,
			uploadedImageToVideo,
			$currentMode,
			$videoMode,
			$photoMode
		);

		if (res) {
			let type: MessageType;
			if ($currentMode === "Video") {
				type = MessageType.singleVideo;
				res = res.url;
			}
			if ($currentMode === "Photo" || $currentMode === "Search") {
				if (Array.isArray(res)) {
					if (res.length === 1) {
						res = res[0];
						type = MessageType.SingleImage;
					} else {
						type = MessageType.ImageList;
					}
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
		loading = false;
	};

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

	const callAudioStream = async (query: string) => {
		const eventSource = await fetchAudioStream(query, voice, knowledge);

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
				setTimeout(() => {
					let content = chatMessages[chatMessages.length - 1]
						.content as string[];
					chatMessages[chatMessages.length - 1].content = [...content, "done"];
					storeMessages();
				}, 2000);
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

			if ($currentMode === "Text") {
				await callTextStream(newMessage.content);
			} else {
				await callGeneralMsg(newMessage.content);
			}

			scrollToBottom(scrollToDiv);
			storeMessages();
			uploadedImageToVideo = false;
		}
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
			if ($currentMode === "Video") {
				await callGeneralMsg(res.asr_result);
				uploadedImageToVideo = false;
			} else {
				await callAudioStream(res.asr_result);
			}
		};
		fileReader.readAsDataURL(audioBlob);
	};

	function handleVideoSubmit(idx: number) {
		const checkedItem = $imageList[idx];

		const newMessage = {
			role: MessageRole.User,
			type: MessageType.SingleImage,
			content: {
				imgSrc: checkedItem.image_path,
				imgId: checkedItem.image_id,
			},
			time: getCurrentTimeStamp(),
		};

		chatMessages = [...chatMessages, newMessage];
		scrollToBottom(scrollToDiv);
		storeMessages();

		uploadedImageToVideo = true;
	}
</script>

<!-- <DropZone on:drop={handleImageSubmit}> -->
<div
	class="h-full items-center gap-5 bg-white sm:flex sm:pb-2 lg:rounded-tl-3xl"
>
	<div class="mx-auto flex h-full w-full flex-col sm:mt-0 sm:w-2/3">
		<Scrollbar
			classLayout="flex flex-col gap-1"
			className="chat-scrollbar h-0 w-full grow px-2 pt-2 mt-3"
		>
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

		<ToolList
			on:closeTool={handelCloseTool}
			on:clickVideoImage={(e) => handleVideoSubmit(e.detail)}
			on:clickImage={(e) => {
				const idx = e.detail;
				currentDragImageList[idx] = !currentDragImageList[idx];
			}}
			on:showPrompt={(e) => {
				showBottomPrompt = e.detail;
			}}
		/>
		<div
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 pb-0 shadow-inner"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<!-- Textarea -->
				<div
					class="input-btn focus:ring-link relative flex max-h-60 w-full flex-col items-center rounded-lg border border-gray-300 p-1 focus:border-transparent focus:outline-none focus:ring-1"
				>
					<div class="relative flex w-full flex-row">
						<VoiceButton
							on:done={(e) => {
								handleAudioSubmit(e.detail);
							}}
						/>
						<div class="relative w-[85%]">
							<textarea
								rows="2"
								class="focus:none mx-2 mr-6 inline-block w-full resize-none border-none p-0 text-sm text-gray-600 focus:ring-0 mt-5"
								{placeholder}
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

						<button
							class="hint-btn absolute right-0 top-5"
							on:click={() => {
								showBottomPrompt = !showBottomPrompt;
								showBottomImages = false;
								toolTile = "Hint";
								getPrompt();
							}}
						>
							<HintIcon extraClass={showBottomPrompt ? "hidden" : ""} />
							<ArrowRight
								extraClass={`${
									!showBottomPrompt ? "hidden" : ""
								} w-5 h-5 rotate-90`}
							/>
						</button>
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
					<KnowledgeAccessPage
						on:change={(e) => {
							knowledgeAccess = e.target.checked;
						}}
					/>
				</div>
				<!-- hint -->

				<PopImageList
					{currentDragImageList}
					on:closeTool={handelCloseTool}
					on:clickVideoImage={(e) => handleVideoSubmit(e.detail)}
					on:clickImage={(e) => {
						const idx = e.detail;
						currentDragImageList[idx] = !currentDragImageList[idx];
					}}
					on:refreshPrompt={() => getPrompt()}
				/>
			</div>

			{#if showBottomPrompt}
				<Scrollbar className="max-h-44 pb-2 w-full mt-2" classLayout="">
					{#each $currentMode === "Search" ? Object.entries(prompts).filter(([k, v]) => k !== "Image Style") : [Object.entries(prompts).find(([k, v]) => k === "Image Style")] as [k, v]}
					<!-- {#each $currentMode === "Search" ? Object.entries(prompts) : [Object.entries(prompts).find(([k, v]) => k === "Image Style")] as [k, v]} -->
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
			{/if}
		</div>
	</div>
</div>

<style>
	/* textarea::placeholder {
		transform: translateY(1.3rem);
	} */
</style>
