<script lang="ts">
	import PictureEnlarge from "$lib/shared/components/images/PictureEnlarge.svelte";
	import {
		currentMode,
		imageList,
		videoMode,
	} from "$lib/shared/stores/common/Store";
	import { createEventDispatcher } from "svelte";
	import Close from "$lib/assets/chat/svelte/Close.svelte";
	import { Dropdown, DropdownItem, Radio } from "flowbite-svelte";
	import Video from "$lib/assets/chat/svelte/Video.svelte";
	import Text from "$lib/assets/chat/svelte/Text.svelte";
	import ChatUploadImages from "./ChatUploadImages.svelte";
	import Warning from "$lib/assets/chat/svelte/Warning.svelte";

	const dispatch = createEventDispatcher();
	let videoChecked = "input";

	function refreshImages(idx: number, imgSrc: string) {
		$imageList[idx].image_path =
			"https://img.zcool.cn/community/0131565aeff3c5a801219b7f6906a7.gif";

		setTimeout(function () {
			$imageList[idx].image_path = imgSrc;
		}, 2000);
	}
	function exchangeMode(mode: string) {
		currentMode.set(mode);
		if (mode === "Video") {
			videoMode.set(videoChecked);
		}
	}
</script>

<div
	class="bg-white absolute left-2 top-0 z-[20] h-[10rem] w-[10rem] border shadow shadow-lg max-sm:h-[7rem] max-sm:w-[7rem]"
>
	<button
		class="absolute right-0 top-0 rounded-full bg-[#eeeeeec7] p-1 z-10"
		on:click={() => dispatch("closeTool")}><Close /></button
	>
	<!-- inner scroll-y -->
	<div class="h-full w-full overflow-x-auto overflow-y-hidden">
		{#if $imageList.length === 0}
			<div class="relative flex flex-col items-center">
				<Warning extraClass="w-full h-full" />
			</div>
		{:else}
		<div class="h-full w-full flex flex-row items-start">
			{#each $imageList as image, idx}
			<div class="block shrink-0">
				<div class="relative">
					<input
						type="checkbox"
						on:change={() => dispatch("clickImage", idx)}
						class="form-checkbox absolute left-2 top-2 z-50 h-3 w-3 rounded-full"
					/>

					<button on:click={() => dispatch("clickVideoImage", idx)}>
						<img
							alt=""
							class="aspect-square h-[5vw] w-[5vw] object-cover p-2 max-sm:h-[28vw] max-sm:w-[28vw]"
							src={image.image_path}
							data-id={image.image_id}
							on:error={() => {
								refreshImages(idx, image.image_path);
							}}
						/>
					</button>
					<div class="itmes-center absolute inset-0 flex justify-center">
						<span />
					</div>
					<PictureEnlarge
						imgSrc={image.image_path}
						enlargeClass={"w-3 h-3"}
						extraClass={"left-3 bottom-5"}
					/>
				</div>
			</div>
			{/each}
		</div>
		{/if}
		<div
			class="absolute -bottom-0 translate-y-1/2 w-full max-w-lg rounded-full border border-gray-200 bg-[#f4f5f7] px-2 py-1"
		>
			<div class="mx-auto flex h-full w-full justify-between">
				<button
					type="button"
					class="group inline-flex flex-col items-center justify-center rounded-full bg-white p-1 hover:bg-gray-50"
					on:click={() => exchangeMode("Photo")}
				>
					<ChatUploadImages on:uploadBegin on:uploadEnd />
				</button>

				<button
					type="button"
					class="group inline-flex flex-col items-center justify-center rounded-full rounded-r-full bg-white p-1 hover:bg-gray-50"
					on:click={() => exchangeMode("Text")}
				>
					<Text />
				</button>
				<button
					type="button"
					id="bell"
					class="group inline-flex flex-row items-center justify-center rounded-full rounded-r-full bg-white p-1 hover:bg-gray-50"
					on:click={() => exchangeMode("Video")}
				>
					<Video />
				</button>

				<Dropdown
					triggeredBy="#bell"
					class="w-[10rem] max-w-sm divide-y divide-gray-100 rounded shadow px-1"
				>
					<p class="text-primary-600 text-[0.8rem] px-1 text-center font-bold">Choose one photo</p>

					<li class="rounded p-1 hover:bg-gray-100">
						<Radio name="videoChecked" bind:group={videoChecked} value={"input"}
							>Input</Radio
						>
						<p class="text-[0.67rem] text-gray-400">
							Generate Video from Input
						</p>
					</li>
					<li class="rounded p-1 hover:bg-gray-100">
						<Radio
							name="videoChecked"
							bind:group={videoChecked}
							value={"output"}>output</Radio
						>
						<p class="text-[0.67rem] text-gray-400">
							Generate Video from Output
						</p>
					</li>
				</Dropdown>
			</div>
		</div>
	</div>
</div>
