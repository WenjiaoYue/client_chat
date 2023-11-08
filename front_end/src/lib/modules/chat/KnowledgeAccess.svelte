<script>
	import KnowledgeAccess from "$lib/assets/chat/svelte/KnowledgeAccess.svelte";
	import { Popover } from "flowbite-svelte";
</script>

<div class="mt-3 flex w-full flex-row items-start gap-1.5 pl-1">
	<KnowledgeAccess />
	<span class="text-xs text-[#611fec]">knowledge Access</span>
	<label class="relative inline-flex cursor-pointer items-center">
		<input type="checkbox" value="" class="peer sr-only" checked on:change />
		<div
			class="peer h-4 w-7 rounded-full bg-gray-200 after:absolute after:left-[1px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
		/>
	</label>
	<!-- <button id="b3">
		<svg
			class="h-4 w-4 text-gray-400 hover:text-gray-500"
			aria-hidden="true"
			fill="currentColor"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
				clip-rule="evenodd"
			/></svg
		>
	</button> -->
</div>
<!-- <Popover
	triggeredBy="#b3"
	class="w-72 bg-white text-sm font-light text-gray-500"
	placement="bottom-start"
>
	<div class="space-y-2 p-3">
		<h3 class="font-semibold text-gray-900 dark:text-white">
			Knowledge Access
		</h3>
	    Support to upload your own knowledge base.
	</div>
</Popover> -->
