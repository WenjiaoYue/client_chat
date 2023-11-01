<script lang="ts">
	import AssistantIcon from "$lib/assets/chat/svelte/Assistant.svelte";
	import PersonOutlined from "$lib/assets/chat/svelte/PersonOutlined.svelte";
	import { TalkingPhotoLibrary } from "$lib/shared/constant/Data";
	import { MessageRole } from "$lib/shared/constant/Interface";
	import { CollectionType, TalkingPhotoCustom, currentAvaTar } from "$lib/shared/stores/common/Store";
	export let role: MessageRole;

	const map: {[key: number]: {avatar: string}[]} = {
		[CollectionType.Custom]: $TalkingPhotoCustom,
		[CollectionType.Library]: TalkingPhotoLibrary,
	}
	$: src = map[$currentAvaTar.collection][$currentAvaTar.id].avatar

</script>

{#if role === MessageRole.User}
	{#if $currentAvaTar}
		<img alt='' {src} class="mx-auto object-cover rounded h-full w-full "/>
	{:else}
		<PersonOutlined />
	{/if}
{:else}
	<AssistantIcon />
{/if}
