<script>
	import KnowledgeAccess from "$lib/assets/chat/svelte/KnowledgeAccess.svelte";

</script>

<div class="flex flex-row items-start w-full gap-1.5 mt-3 pl-1">
        <KnowledgeAccess />
        <span class="text-xs text-[#611fec]">knowledge Access</span>
        <label class="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" value="" class="peer sr-only" />
            <div
                class="peer h-4 w-7 rounded-full bg-gray-200 after:absolute after:left-[1px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
            />
        </label>
</div>
