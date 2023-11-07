<script lang="ts">
	import {
		CollectionType,
		TalkingVoiceCustom,
		currentVoice,
	} from "$lib/shared/stores/common/Store";
	import { TalkingVoiceLibrary } from "$lib/shared/constant/Data";
	import { getNotificationsContext } from "svelte-notifications";
	import RecordVoice from "$lib/modules/voice/RecordVoice.svelte";
	import UploadVoice from "$lib/modules/voice/UploadVoice.svelte";
	import TalkingVoiceCard from "$lib/modules/voice/TalkingVoiceCard.svelte";
	import FloatButton from "$lib/shared/components/float-button/FloatButton.svelte";
	import { fetchAudioEmbedding } from "$lib/network/talkbot/Network";
	import Fast from "$lib/assets/customize/svelte/Fast.svelte";
	import Diamond from "$lib/assets/customize/svelte/Diamond.svelte";
	import { Spinner } from "flowbite-svelte";
	import Notification from "$lib/assets/image-info/svelte/notification.svelte";

	const { addNotification } = getNotificationsContext();
	const customNum = $TalkingVoiceCustom.length;
	let loading = false;
	let qualityMode = true;
	const btnStyle = {
		init: `flex rounded-lg bg-indigo-600 px-4 py-3 text-center text-[0.8rem] font-semibold text-white  max-sm:p-2 `,
		inactive: ``,
		active: `outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-indigo-200`,
	};

	async function handleVoiceUpload(e: CustomEvent<any>) {
		loading = true;
		let spk_id = "";
		try {
			const blob = await fetch(e.detail.src).then((r) => r.blob());
			const res = await fetchAudioEmbedding(blob, qualityMode);
			spk_id = res.voice_id ? res.voice_id : "default";
			console.log('spk_id', spk_id);
			
		} catch {
			spk_id = "default";
		}
		TalkingVoiceCustom.update((options) => {
			return [
				{ name: e.detail.fileName, audio: e.detail.src, id: spk_id },
				...options,
			];
		});
		loading = false;
		addNotification({
			text: "Uploaded successfully",
			position: "bottom-center",
			type: "success",
			removeAfter: 3000,
		});
	}

	async function handleVoiceRecord(e: CustomEvent<any>) {
		loading = true;
		let spk_id = "";
		try {
			const blob = await fetch(e.detail.src).then((r) => r.blob());
			const res = await fetchAudioEmbedding(blob, qualityMode);
			spk_id = res.spk_id ? res.spk_id : "default";
		} catch {
			spk_id = "default";
		}
		TalkingVoiceCustom.update((options) => {
			return [
				{ name: "New Record", audio: e.detail.src, id: spk_id },
				...options,
			];
		});
		loading = false;
	}

	function handleVoiceDelete(i: number) {
		TalkingVoiceCustom.update((options) => {
			options.splice(i, 1);
			return options;
		});
	}

	function handleRecordFail() {
		addNotification({
			text: "At least 10s required!",
			position: "bottom-center",
			type: "warning",
			removeAfter: 3000,
		});
	}
</script>

<div class="flex h-full">
	<div class="mt-4 w-full p-5 sm:mx-5 xl:mx-20">
		<p
			class="mb-8 text-[1.3rem] font-medium leading-tight text-[#051F61] md:pr-0"
		>
			My Voices
		</p>
		<div
			class="mb-[3.5rem] flex flex-row items-end gap-7 max-sm:mb-12 max-sm:gap-4"
		>
			<button
				type="button"
				class={`${btnStyle.init}  ${
					qualityMode ? btnStyle.active : btnStyle.inactive
				}`}
				on:focus={() => {
					qualityMode = true;
				}}
			>
				<Fast />
				&nbsp; Create fast voice
			</button>
			<button
				type="button"
				class={`${btnStyle.init} ${
					qualityMode ? btnStyle.inactive : btnStyle.active
				}`}
				on:focus={() => {
					qualityMode = false;
				}}
			>
				<Diamond />
				&nbsp;Create high quality voice</button
			>
		</div>
		<div class="flex flex-wrap items-center gap-10 text-[#0F172A] max-sm:gap-5">
			<RecordVoice on:done={handleVoiceRecord} on:fail={handleRecordFail} />
			<UploadVoice on:upload={handleVoiceUpload} />
			{#if loading}
				<Spinner color="blue" size="10" />
			{/if}
			{#each $TalkingVoiceCustom as opt, i}
				<button
					class="aspect-square h-24 rounded"
					class:ring={$currentVoice.collection === CollectionType.Custom &&
						$currentVoice.id === i}
					on:click={() => {
						currentVoice.set({ collection: CollectionType.Custom, id: i });
					}}
				>
					<TalkingVoiceCard
						audio={opt.audio}
						bind:name={opt.name}
						needChangeName={i >= customNum}
						notLibrary
						on:delete={() => handleVoiceDelete(i)}
					/>
				</button>
			{/each}
		</div>

		<div class="mb-1 flex w-full flex-row flex-wrap justify-between sm:mb-0" />

		<div
			class="mb-1 mt-14 flex w-full flex-row flex-wrap justify-between sm:mb-0"
		>
			<p
				class="mb-6 text-[1.3rem] font-medium leading-tight text-[#051F61] md:pr-0"
			>
				Voice Library
			</p>
		</div>
		<div class="flex h-24 w-full gap-7 overflow-auto p-1 text-[#0F172A]">
			{#each TalkingVoiceLibrary as opt, i}
				<button
					class="aspect-square h-full rounded"
					class:ring={$currentVoice.collection === CollectionType.Library &&
						$currentVoice.id === i}
					on:click={() => {
						currentVoice.set({ collection: CollectionType.Library, id: i });
					}}
				>
					<TalkingVoiceCard {...opt} on:delete={() => handleVoiceDelete(i)} />
				</button>
			{/each}
		</div>
	</div>
	<!-- <FloatButton destination="go to chat" url="/" /> -->
</div>
