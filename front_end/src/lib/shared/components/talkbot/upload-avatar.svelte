<script lang="ts">
	import Upload from "$lib/assets/handel/Upload.svelte";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const file = (event.target as HTMLInputElement).files![0];

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

<div class="m-auto">
	<Upload type="image" />

	<input
		id="image"
		type="file"
		required
		on:change={handleInput}
		accept="image/*"
	/>
</div>

<style lang="postcss">
	input[type="file"] {
		display: none;
	}
</style>
