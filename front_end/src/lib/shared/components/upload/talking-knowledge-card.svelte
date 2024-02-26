<script lang="ts">
	import { afterUpdate, createEventDispatcher, onMount } from "svelte";
	import DeleteIcon from "$lib/assets/avatar/svelte/Delete.svelte";

	export let name: string;
	
	export let needChangeName = false;

	console.log('name', name, i);
	

	const dispatch = createEventDispatcher();
	let inputEl: HTMLInputElement;

	onMount(() => {
		if (needChangeName) {
			changeName();
		}
	});
	afterUpdate(() => {
		if (inputEl) {
			inputEl.focus();
			inputEl.onblur = () => {
				needChangeName = false;
			};
		}
	});

	function changeName() {
		needChangeName = true;
	}
</script>

<div class="relative w-full">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="flex w-full flex-col items-center justify-center">
			<!-- <DeleteIcon on:DeleteAvatar={() => dispatch("delete")} /> -->
		<span
			class="relative w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-bold text-gray-600 truncate my-2 border-b-2 p-1"
		>
			{name}
		</span>
	</div>
</div>
