<script lang="ts">
	import MessageAvatar from "$lib/modules/chat/MessageAvatar.svelte";
	import { MessageRole, type Message } from "$lib/shared/constant/Interface";

	export let msg: Message;
</script>

<div
	class="flex w-full gap-3"
	class:flex-row-reverse={msg.role === MessageRole.User}
>
	<div
		class={msg.role === 0
			? "flex aspect-square w-1  items-center justify-center rounded bg-[#0068B5] max-sm:hidden"
			: "flex aspect-square h-10 w-1 items-center justify-center rounded bg-[#3369ff] max-sm:hidden"}
	>
		<MessageAvatar role={msg.role} />
	</div>
	<div class="group relative">
		<div>
			<p
				class="max-w-[60vw] whitespace-pre-line break-keep text-[0.8rem] leading-5 sm:max-w-[32rem]"
			>
				{@html msg.content}
			</p>
		</div>
	</div>
</div>

<style>
	.wrap-style {
		word-wrap: break-word;
		word-break: break-all;
	}
</style>
