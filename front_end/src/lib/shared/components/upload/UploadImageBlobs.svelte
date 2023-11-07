<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import upload from "$lib/assets/home/imgs/upload.png";

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const files = (event.target as HTMLInputElement).files;

		if (!files) return;

		dispatch("upload", { blobs: files });
		// for (let i = 0; i < files.length; ++i) {
		// 	const reader = new FileReader();
		// 	reader.onloadend = () => {
		// 		if (!reader.result) return;
		// 		const src = reader.result.toString();
		// 		dispatch("upload", { src: src, fileName: files[i].name });
		// 	};
		// 	reader.readAsDataURL(files[i]);
		// }
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="relative" on:click|capture|nonpassive|stopPropagation={() => {}}>
	<label for="image" class="h-full w-full cursor-pointer text-center">
		<slot>
			<div class="relative h-full w-full">
				<img
					src={upload}
					alt=""
					class="aspect-square h-[5vw] w-[5vw] object-cover p-2 max-sm:h-[28vw] max-sm:w-[28vw]"
				/>
			</div>
		</slot>
	</label>
	<input
		id="image"
		type="file"
		required
		on:change={handleInput}
		accept="image/*"
		multiple
	/>
</div>

<style lang="postcss">
	input[type="file"] {
		display: none;
	}
</style>
