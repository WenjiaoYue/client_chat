<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import uploadFile from '$lib/assets/voice/svg/uploadFile.svg';

	const dispatch = createEventDispatcher();

	// let dialog: HTMLDialogElement

	function handleInput(event: Event) {
		const file = (event.target as HTMLInputElement).files![0];
        console.log(file);

		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			if (!reader.result) return;
			const src = reader.result.toString();
			dispatch("upload", { src: src, fileName: file.name });
		};
		reader.readAsDataURL(file);
	}
</script>

<label for="audio" class="flex flex-col items-center justify-center w-full aspect-square shadow-[0_2px_30px_0_rgba(0,0,0,0.1)] rounded-xl text-center">
	<img class="h-10 swap-on" src={uploadFile} alt=""/>
	<p class="text-xs text-gray-500">Upload</p>
</label>

<input
	id="audio"
	type="file"
	required
	on:change={handleInput}
	accept="audio/*"
/>

<style lang="postcss">
	input[type="file"] {
		display: none;
	}
</style>
