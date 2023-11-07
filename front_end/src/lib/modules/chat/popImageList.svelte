<script lang="ts">
	import { Button, Modal } from "flowbite-svelte";
	import { imageList, popupModal } from "$lib/shared/stores/common/Store";
	import ChatUploadImages from "./ChatUploadImages.svelte";
	import { createEventDispatcher } from "svelte";
	import PictureEnlarge from "$lib/shared/components/images/PictureEnlarge.svelte";
	import ImageIcon from "$lib/assets/chat/svelte/ImageIcon.svelte";

	const dispatch = createEventDispatcher();
	function refreshImages(idx: number, imgSrc: string) {
		$imageList[idx].image_path =
			"https://img.zcool.cn/community/0131565aeff3c5a801219b7f6906a7.gif";

		setTimeout(function () {
			$imageList[idx].image_path = imgSrc;
		}, 2000);
	}
</script>

<button
	class="image-btn h-full"
	on:click={() => {
		popupModal.set(true);
	}}
>
	<!-- <ImageIcon /> -->
</button>


<Modal title="Photo Album" bind:open={$popupModal} autoclose>
    <div class="text-center">
		<div class="flex h-full w-full flex-row items-start">
			<ChatUploadImages on:uploadBegin on:uploadEnd />
			{#each $imageList as image, idx}
				<div class="block shrink-0">
					<div class="relative">
						<input
							type="checkbox"
							on:change={() => dispatch("clickImage", idx)}
							class="form-checkbox absolute left-2 top-2 z-50 h-3 w-3 rounded-full"
						/>

						<button on:click={() => dispatch("clickVideoImage", idx)}>
							<img
								alt=""
								class="aspect-square h-[6vw] w-[6vw] object-cover p-2 max-sm:h-[28vw] max-sm:w-[28vw]"
								src={image.image_path}
								data-id={image.image_id}
								on:error={() => {
									refreshImages(idx, image.image_path);
								}}
							/>
						</button>
						<div class="itmes-center absolute inset-0 flex justify-center">
							<span />
						</div>
						<PictureEnlarge
							imgSrc={image.image_path}
							enlargeClass={"w-3 h-3"}
							extraClass={"left-3 bottom-5"}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>    
    <svelte:fragment slot="footer">
      <Button>Confirm</Button>
      <Button color="alternative">Decline</Button>
    </svelte:fragment>
  </Modal>