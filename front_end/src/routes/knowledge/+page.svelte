<script lang="ts">
	import { TalkingKnowledgeLibrary } from "$lib/shared/constant/Data";
	import {
		CollectionType,
		currentKnowledge,
		TalkingKnowledgeCustom,
	} from "$lib/shared/stores/common/Store";
	import UploadKnowledge from "$lib/shared/components/talkbot/upload-knowledge.svelte";
	import TalkingKnowledgeCard from "$lib/shared/components/talkbot/talking-knowledge-card.svelte";
	import { fetchKnowledgeBaseId } from "$lib/network/talkbot/Network";
	import Warning from "$lib/assets/chat/svelte/Warning.svelte";
	import FloatButton from "$lib/shared/components/float-button/FloatButton.svelte";

	const customNum = $TalkingKnowledgeCustom.length;
	let loading = false;

	async function handleKnowledgeUpload(e: CustomEvent<any>) {
		loading = true;
		let knowledge_id = "";
		try {
			const blob = await fetch(e.detail.src).then((r) => r.blob());
			const res = await fetchKnowledgeBaseId(blob);
			knowledge_id = res.knowledge_id ? res.knowledge_id : "default";
		} catch {
			knowledge_id = "default";
		}

		loading = false;

		TalkingKnowledgeCustom.update((options) => {
			return [
				{ name: e.detail.fileName, src: e.detail.src, id: knowledge_id },
				...options,
			];
		});
	}

	function handleKnowledgeDelete(i: number) {
		TalkingKnowledgeCustom.update((options) => {
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
				My Knowledge Base
			</p>
		</div>
		{#if $TalkingKnowledgeCustom.length === 0}
			<div class="flex h-40 flex-col items-center justify-center">
				<div class="flex">
					<Warning extraClass="h-28 w-28" />
				</div>
				<div class="flex flex-col justify-center">
					<UploadKnowledge on:upload={handleKnowledgeUpload}>
						<div
							class="-ml-10 w-40 cursor-pointer rounded text-xs text-[#8c75ff] ring-1 ring-[#8c75ff] py-2"
						>
							<p>Upload Knowledge Base</p>
						</div>
					</UploadKnowledge>
					<span
						class="loading loading-bars loading-md text-[#8c75ff]"
						class:hidden={!loading}
					/>
				</div>
			</div>
		{:else}
			<div class="flex flex-wrap gap-2 text-[#0F172A]">
				<UploadKnowledge on:upload={handleKnowledgeUpload} />
				<span
					class="loading loading-bars loading-md text-[#8c75ff]"
					class:hidden={!loading}
				/>
				{#each $TalkingKnowledgeCustom as opt, i (opt.name + i)}
					<button
						class:ring={$currentKnowledge.collection ===
							CollectionType.Custom && $currentKnowledge.id === i}
						on:click={() => {
							currentKnowledge.set({
								collection: CollectionType.Custom,
								id: i,
							});
						}}
					>
						<TalkingKnowledgeCard
							bind:name={opt.name}
							needChangeName={i >= customNum}
							notLibrary
							on:delete={() => handleKnowledgeDelete(i)}
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
				Knowledge Base Library
			</p>
		</div>
		<div class="flex flex-wrap gap-7 p-1 text-[#0F172A]">
			{#each TalkingKnowledgeLibrary as opt, i (opt.name + i)}
				<button
					class:ring={$currentKnowledge.collection === CollectionType.Library &&
						$currentKnowledge.id === i}
					class="mx-5 aspect-square h-full max-sm:m-0"
					on:click={() => {
						currentKnowledge.set({ collection: CollectionType.Library, id: i });
					}}
				>
					<TalkingKnowledgeCard {...opt} />
				</button>
			{/each}
		</div>
		<!-- <FloatButton destination="go to chat" url="/" /> -->
	</div>
</div>
