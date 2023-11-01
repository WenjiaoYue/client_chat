<script lang="ts">
	import Warning from "$lib/assets/chat/svelte/Warning.svelte";
	import {
		CollectionType,
		TalkingPhotoCustom,
		currentAvaTar,
	} from "$lib/shared/stores/common/Store";
	import { TalkingPhotoLibrary } from "$lib/shared/constant/Data";
	import TalkingPhotoCard from "$lib/shared/components/talkbot/talking-photo-card.svelte";
	import UploadAvatar from "$lib/shared/components/talkbot/upload-avatar.svelte";
	import FloatButton from "$lib/shared/components/float-button/FloatButton.svelte";

	const customNum = $TalkingPhotoCustom.length;

	function handleAvatarUpload(e: CustomEvent<any>) {
		TalkingPhotoCustom.update((options) => {
			return [{ name: e.detail.fileName, avatar: e.detail.src }, ...options];
		});
	}

	function handleAvatarDelete(i: number) {
		TalkingPhotoCustom.update((options) => {
			options.splice(i, 1);
			return options;
		});
	}
</script>

<div class="flex h-full">
	<div class="h-full w-full p-5 shadow sm:mx-5 xl:mx-20">
		<div class="mb-1 flex w-full flex-row flex-wrap justify-between sm:mb-0">
			<p
				class="mb-6 text-[1.3rem] font-medium leading-tight text-[#051F61] md:pr-0"
			>
				My Avatars
			</p>
		</div>
		{#if $TalkingPhotoCustom.length === 0}
			<div class="flex h-40 flex-col items-center justify-center">
				<div class="flex">
					<Warning extraClass="h-28 w-28" />
				</div>
				<div class="flex flex-col justify-center">
					<UploadAvatar on:upload={handleAvatarUpload}>
						<div
							class="flex cursor-pointer items-center gap-2 rounded px-2 text-xs text-[#8c75ff] ring-1 ring-[#8c75ff] py-2"
						>
							<p>Upload Avatar</p>
						</div>
					</UploadAvatar>
				</div>
			</div>
		{:else}
			<div class="flex flex-wrap gap-2 py-1 text-[#0F172A]">
				<UploadAvatar on:upload={handleAvatarUpload} />
				{#each $TalkingPhotoCustom as opt, i (opt.name + i)}
					<button
						class:ring={$currentAvaTar.collection === CollectionType.Custom &&
							$currentAvaTar.id === i}
						class="aspect-square h-20"
						on:click={() => {
							currentAvaTar.set({ collection: CollectionType.Custom, id: i });
						}}
					>
						<TalkingPhotoCard
							bind:name={opt.name}
							avatar={opt.avatar}
							needChangeName={i >= customNum}
							notLibrary
							on:delete={() => handleAvatarDelete(i)}
						/>
					</button>
				{/each}
			</div>
		{/if}

		<div
			class="mb-1 mt-5 flex w-full flex-row flex-wrap justify-between sm:mb-0"
		>
			<p
				class="mb-6 text-[1.3rem] font-medium leading-tight text-[#051F61] md:pr-0"
			>
				Avatar Library
			</p>
		</div>
		<div class="flex flex-wrap gap-3 p-1 text-[#0F172A]">
			{#each TalkingPhotoLibrary as opt, i (opt.name + i)}
				<button
					class:ring={$currentAvaTar.collection === CollectionType.Library &&
						$currentAvaTar.id === i}
					class="aspect-square h-20"
					on:click={() => {
						currentAvaTar.set({ collection: CollectionType.Library, id: i });
					}}
				>
					<TalkingPhotoCard {...opt} />
				</button>
			{/each}
		</div>
		<!-- <FloatButton destination="go to chat" url="/" /> -->
	</div>
</div>
