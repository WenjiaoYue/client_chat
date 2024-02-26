<script lang="ts">
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
	import Previous from "$lib/assets/upload/previous.svelte";
	import Next from "$lib/assets/upload/next.svelte";
	import PaperAirplane from "$lib/assets/chat/svelte/PaperAirplane.svelte";

	let query: string = "";
	let loading: boolean = false;
	let scrollToDiv: HTMLDivElement;
	export let items;
	// ·········

	$: knowledge = $TalkingKnowledgeCustom[0]
		? $TalkingKnowledgeCustom[0].id
		: "default";

	function isEmptyObject(obj: any): boolean {
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}

	// gallery
	let currentIndex = 0;

	function nextItem() {
		currentIndex = (currentIndex + 1) % items.length;
		console.log("nextItem", currentIndex);
	}

	function prevItem() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
		console.log("prevItem", currentIndex);
	}

	$: currentItem = items[currentIndex];
	console.log("currentItem", currentItem, items, currentIndex, items[0]);

	// gallery
</script>

<div
	id="custom-controls-gallery"
	class="chat-scrollbar relative mb-8 h-0 w-full w-full grow px-2"
	data-carousel="slide"
>
	<!-- Carousel wrapper -->
	<!-- Display current item -->
	{#if currentItem}
		<Scrollbar
			classLayout="flex flex-col gap-5"
			className="chat-scrollbar h-0 w-full grow px-2 mt-3 ml-10"
		>
			{#each currentItem.content as message, i}
				<ChatMessage msg={message} />
			{/each}
		</Scrollbar>
		<!-- Loading text -->
	{/if}

	{#if currentItem.time !== "0s"}
		<div class="radius absolute right-0 p-2">
			<!-- Display end to end time -->
			<label for="" class="mr-2 text-xs font-bold text-blue-700"
				>End to End Time:
			</label>
			<label for="" class="text-xs">{currentItem.time}</label>
		</div>
	{/if}
	<div class="flex items-center justify-between">
		<div class="justify-left ml-2 flex items-center">
			<!-- Previous button -->
			<button
				type="button"
				class="group absolute start-0 top-0 z-30 flex h-full
									cursor-pointer items-center justify-center px-4
									focus:outline-none"
				on:click={prevItem}
			>
				<span
					class="group-focus:ring-gray dark:group-hover:bg-[#000]-800/60 dark:group-focus:ring-[#000]-800/70 inline-flex h-10
										 w-10 items-center justify-center
										 rounded-full bg-[#000]/10
										 group-hover:bg-[#000]/50 group-focus:bg-[#000]/50
										 group-focus:outline-none
										 group-focus:ring-4 dark:bg-gray-800/30"
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
					class="group-focus:ring-gray dark:group-hover:bg-[#000]-800/60 dark:group-focus:ring-[#000]-800/70 inline-flex h-10
									w-10 items-center justify-center
									rounded-full bg-[#000]/10
									group-hover:bg-[#000]/50 group-focus:bg-[#000]/50
									group-focus:outline-none
									group-focus:ring-4 dark:bg-gray-800/30"
				>
					<Next />
					<span class="sr-only">Next</span>
				</span>
			</button>
		</div>
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