<script lang="ts">
	import { goto } from "$app/navigation";

	const tabs = [
		{
			background: "bg-[url('$lib/assets/customize/photo.png')]",
			title: "Photo",
			link: "/info",
		},
		{
			background: "bg-[url('$lib/assets/customize/avatar.jpg')]",
			title: "Avatars",
			link: "/avatar",
		},
		{
			background: "bg-[url('$lib/assets/customize/voice.png')]",
			title: "Voices",
			link: "/voice",
		},
		{
			background: "bg-[url('$lib/assets/customize/knowledge.jpg')]",
			title: "Knowledge Bases",
			link: "/knowledge",
		},
	];
</script>

<div class="mt-8 flex h-full flex-col lg:flex-row items-center justify-end lg:justify-start lg:items-start lg:p-12 gap-3 max-width">
	{#each tabs as tab}
		<button
			on:click={() => goto(tab.link)}
			class="flex h-full w-11/12 lg:h-52 lg:w-52 items-end rounded-xl {tab.background} bg-cover bg-no-repeat"
		>
			<p
				class="w-full rounded-b-xl bg-black bg-opacity-30 pb-2 pl-2 text-left text-xl text-white"
			>
				{tab.title}
			</p>
		</button>
	{/each}
</div>
