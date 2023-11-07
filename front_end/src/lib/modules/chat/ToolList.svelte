<script lang="ts">
	import PictureEnlarge from "$lib/shared/components/images/PictureEnlarge.svelte";
	import {
		currentMode,
		imageList,
		photoMode,
		popupModal,
		videoMode,
	} from "$lib/shared/stores/common/Store";
	import { createEventDispatcher } from "svelte";
	import Close from "$lib/assets/chat/svelte/Close.svelte";
	import { Dropdown, DropdownItem, Modal, Radio } from "flowbite-svelte";
	import Video from "$lib/assets/chat/svelte/Video.svelte";
	import Text from "$lib/assets/chat/svelte/Text.svelte";
	import ChatUploadImages from "./ChatUploadImages.svelte";
	import Warning from "$lib/assets/chat/svelte/Warning.svelte";
	import ColorImg from "$lib/assets/chat/svelte/ColorImg.svelte";

	const dispatch = createEventDispatcher();
	let videoChecked = "input";
	let photoChecked = "photoChat";
	const toolStyle = {
		init: `group mx-1 inline-flex flex-col items-center justify-center rounded-full rounded-r-full bg-white p-1 px-2 hover:bg-gray-50`,
		inactive: ``,
		active: `outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-indigo-200`,
	};
	function exchangeMode(mode: string) {
		currentMode.set(mode);
		if (mode === "Video") {
			videoMode.set(videoChecked);
		} 
		if (mode === "Photo") {
			photoMode.set(photoChecked)
		}
	}
</script>

<div class="m-1 flex inline-flex p-1">
	<div class="rounded-full border border-gray-200 bg-[#f4f5f7] px-2 py-1">
		<div class="mx-auto flex h-full">
			<button
				type="button"
				class={`${toolStyle.init}  ${
					$currentMode === "Text" ? toolStyle.active : toolStyle.inactive
				}`}
				on:click={() => exchangeMode("Text")}
			>
				<Text />
				<!-- <span class="text-[0.5rem] text-gray-400">Text Mode</span> -->
			</button>
			<button
				type="button"
				id="photoChoose"
				class={`${toolStyle.init}  ${
					$currentMode === "Photo" ? toolStyle.active : toolStyle.inactive
				}`}
				on:click={() => {
					exchangeMode("Photo");
				}}
			>
				<ColorImg />
				<!-- <span class="text-[0.5rem] text-gray-400">Photo Mode</span> -->
			</button>

			<Dropdown
				triggeredBy="#photoChoose"
				class="w-[10rem] max-w-sm divide-y divide-gray-100 rounded px-1 shadow"
			>
				<li class="rounded p-1 hover:bg-gray-100">
					<Radio
						name="photoChecked"
						bind:group={photoChecked}
						value={"photoChat"}
					>
						<p class="text-xs">Chat with Photos</p></Radio
					>
				</li>
				<li class="rounded p-1 hover:bg-gray-100">
					<Radio
						name="photoChecked"
						bind:group={photoChecked}
						value={"styleTransfer"}
						on:click={() => {
							popupModal.set(true);
						}}
						><p class="text-xs">Photo Style Transfer</p>
					</Radio>
				</li>
			</Dropdown>

			<button
				type="button"
				id="videoChoose"
				class={`${toolStyle.init}  ${
					$currentMode === "Video" ? toolStyle.active : toolStyle.inactive
				}`}
				on:click={() => exchangeMode("Video")}
			>
				<Video />
				<!-- <span class="text-[0.5rem] text-gray-400">Video Mode</span> -->
			</button>

			<Dropdown
				triggeredBy="#videoChoose"
				class="w-[10rem] max-w-sm divide-y divide-gray-100 rounded px-1 shadow"
			>
				<button
					on:click={() => {
						popupModal.set(true);
					}}
					class="text-primary-600 px-1 text-center text-[0.8rem] font-bold"
				>
					{"Choose one photo ->"}
				</button>

				<li class="rounded p-1 hover:bg-gray-100">
					<Radio name="videoChecked" bind:group={videoChecked} value={"input"}
						>Input</Radio
					>
					<p class="text-[0.67rem] text-gray-400">Generate Video from Input</p>
				</li>
				<li class="rounded p-1 hover:bg-gray-100">
					<Radio name="videoChecked" bind:group={videoChecked} value={"output"}
						>output</Radio
					>
					<p class="text-[0.67rem] text-gray-400">Generate Video from Output</p>
				</li>
			</Dropdown>
		</div>
	</div>
</div>
