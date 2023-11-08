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
		currentKnowledge,
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
	import { TalkingTemplateLibrary, TalkingVoiceLibrary } from "$lib/shared/constant/Data.js";
	import FloatImageList from "$lib/modules/chat/FloatImageList.svelte";
	import HintIcon from "$lib/assets/chat/svelte/HintIcon.svelte";
	import UploadImageBlobs from "$lib/shared/components/upload/UploadImageBlobs.svelte";
	import ChatUploadImages from "$lib/modules/chat/ChatUploadImages.svelte";
	import ColorImg from "$lib/assets/chat/svelte/ColorImg.svelte";
	import ToolList from "$lib/modules/chat/ToolList.svelte";
	import PictureEnlarge from "$lib/shared/components/images/PictureEnlarge.svelte";
	import PopImageList from "$lib/modules/chat/popImageList.svelte";
	import Notification from "$lib/assets/image-info/svelte/notification.svelte";
	import { getNotificationsContext } from "svelte-notifications";
	import KnowledgeAccess from "$lib/modules/chat/KnowledgeAccess.svelte";

	let query: string = "";
	const { addNotification } = getNotificationsContext();
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
	let uploadedImageToVideo = false;
	let knowledgeAccess = false

	let chatMessages: Message[] = data.chatMsg ? data.chatMsg : [];
	let prompts = {
		"Image Style": ["pencil sketch", "disney cartoon", "illustration", "pixar"],
	};
	let group: string[] = [];
	const voice =
		$currentTemplate.collection === CollectionType.Custom
			? $TemplateCustom[$currentTemplate.id].identify
			: TalkingTemplateLibrary[$currentTemplate.id].identify;
	$: knowledge = knowledgeAccess ? (
		$currentTemplate.collection === CollectionType.Custom
			? $TemplateCustom[$currentTemplate.id].knowledge
			: TalkingTemplateLibrary[$currentTemplate.id].knowledge
	) : "default"
		
	let showFloatImg = false;

	$: placeholder =
		chatMessages.length &&
		chatMessages[chatMessages.length - 1].role === MessageRole.User &&
		isImage(chatMessages[chatMessages.length - 1].type)
			? "Ask me about..."
			: "Upload images/Ask me about...";


	$: currentDragImageList = new Array($imageList.length).fill(false);

	console.log("new Array($imageList.length)", $imageList.length);
	console.log("currentDragImageList", currentDragImageList);

	$: $currentMode !== "Photo" ? (showFloatImg = true) : (showFloatImg = false);

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
			"Image Style": `Transform it to ${word} style`,
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

	const callGeneralMsg = async (query: string) => {
		const checkedItems = $imageList
			.filter((_, i) => currentDragImageList[i])
			.map((item) => ({
				imgSrc: item.image_path,
				imgId: item.image_id,
			}));
		// network
		console.log("11.6 --", checkedItems.length, $currentMode);
		if ($currentMode === "Video" && checkedItems.length !== 1) {
			addNotification({
				text: "Please select one photo!",
				position: "bottom-center",
				type: "warning",
				removeAfter: 3000,
			});
		} else if ($photoMode === "styleTransfer" && checkedItems.length === 0) {
			addNotification({
				text: "Please select photos!",
				position: "bottom-center",
				type: "warning",
				removeAfter: 3000,
			});
		} else {
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
				if ($currentMode === "Photo") {
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
		}
		loading = false;
	};

	const callTextStream = async (query: string) => {

		const eventSource = await fetchTextStream(query, knowledge);

		eventSource.addEventListener("message", (e: any) => {

			let currentMsg = e.data;
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
				let content = chatMessages[chatMessages.length - 1].content as string[];
				chatMessages[chatMessages.length - 1].content = [...content, "done"];
				storeMessages();
			}
		});
		eventSource.stream();
	};
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

		if ($currentMode === "Text") {
			await callTextStream(newMessage.content);
		} else {
			await callGeneralMsg(newMessage.content);
		}

		scrollToBottom(scrollToDiv);
		storeMessages();
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

		console.log("newMessage", newMessage);

		chatMessages = [...chatMessages, newMessage];
		scrollToBottom(scrollToDiv);
		storeMessages();

		uploadedImageToVideo = true;
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

<!-- <DropZone on:drop={handleImageSubmit}> -->
<div class="h-full items-center gap-5 sm:flex sm:px-20 sm:pb-2">
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
			on:uploadBegin={handleUploadBegin}
			on:uploadEnd={handleUploadEnd}
		/>
		<div
			class="fixed relative flex w-full flex-col items-center justify-between bg-white p-2 shadow-inner"
		>
			{#if uploadProgress}
				<Progressbar
					progress={uploadProgress.toString()}
					size="h-1"
					color="blue"
					class="mb-2"
				/>
			{/if}
			<div class="flex w-full flex-row items-center justify-between gap-3 pt-2">
				<!-- Textarea -->
				<div
					class="input-btn focus:ring-link relative flex max-h-60 w-full flex-col items-center rounded-lg border border-gray-300 p-1 focus:border-transparent focus:outline-none focus:ring-1"
				>
					<div class="flex flex-row w-full">
						<VoiceButton
							on:done={(e) => {
								handleAudioSubmit(e.detail);
							}}
						/>
						<textarea
							rows="2"
							class="focus:none mx-2 mr-6 inline-block w-full resize-none border-none p-0 text-sm text-gray-600 focus:ring-0"
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
						<button
							class="absolute bottom-3 right-1"
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
					<KnowledgeAccess on:change={(e) => {
						knowledgeAccess = e.target.checked
						if (knowledgeAccess) showSidePage.set(true)
					}}/>
				</div>
				<!-- hint -->
				<button
					class="hint-btn"
					on:click={() => {
						showBottomPrompt = !showBottomPrompt;
						showBottomImages = false;
						toolTile = "Hint";
					}}
				>
					<HintIcon extraClass={showBottomPrompt ? "hidden" : ""} />
					<ArrowRight
						extraClass={`${
							!showBottomPrompt ? "hidden" : ""
						} w-5 h-5 rotate-90`}
					/>
				</button>
				<PopImageList
					on:closeTool={handelCloseTool}
					on:clickVideoImage={(e) => handleVideoSubmit(e.detail)}
					on:clickImage={(e) => {
						const idx = e.detail;
						currentDragImageList[idx] = !currentDragImageList[idx];
					}}
					on:uploadBegin={handleUploadBegin}
					on:uploadEnd={handleUploadEnd}
				/>
			</div>
			<!-- under moible mode -->
			<!-- {#if showBottomImages}
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
				{/if} -->

			{#if showBottomPrompt}
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
			{/if}
		</div>
	</div>
	<!-- <ChatImageCard
			extraClass="max-sm:hidden"
			on:clickSend={handleImageListSubmit}
			on:clickImage={(e) => {
				const idx = e.detail;
				currentDragImageList[idx] = !currentDragImageList[idx];
			}}
			on:uploadBegin={handleUploadBegin}
			on:uploadEnd={handleUploadEnd}
		/> -->
</div>

<!-- </DropZone> -->

<!-- <ChatUploadImages on:uploadBegin on:uploadEnd />	 -->

<style>
</style>
