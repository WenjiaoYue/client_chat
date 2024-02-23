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
		class="flex aspect-square h-10 items-center justify-center rounded bg-[#0068B5] max-sm:hidden"
	>
		<MessageAvatar role={msg.role} />
	</div>
	<div class="group relative">
		<div
			class={msg.role === MessageRole.User
				? "wrap-style relative ml-4 rounded-l-lg rounded-br-lg border-2 border-[#3369FF] bg-[#3369FF] p-2 text-white"
				: "wrap-style relative mr-4 rounded-r-lg rounded-bl-lg  bg-blue-50 p-2 text-blue-800"}
		>
			<p class="sm:max-w-[32rem] max-w-[60vw] whitespace-pre-line text-[0.8rem] break-keep leading-5">{@html msg.content}</p>
		</div>
	</div>
</div>

<style>
	.wrap-style {
		word-wrap: break-word;
		word-break: break-all;
	}
</style>
