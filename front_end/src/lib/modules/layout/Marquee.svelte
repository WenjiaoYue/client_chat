<script lang="ts">
	import { Alert } from "flowbite-svelte";
	import { trafficHint } from "$lib/shared/Utils";
	import { onMount } from "svelte";
  
	let content = '';
  
	const interval = 3000;
  
	// const updateContent = async () => {  
	//   const result = await trafficHint();
	//   if (result && result > 1) {
	// 	content = result + ` people ahead of you. Please wait a moment!`; 
	//   }
  
	//   setTimeout(updateContent, interval);
	// };
  
	// onMount(() => {
	//   setTimeout(updateContent, interval);
	// });
  </script>
  
  <!-- {#if content != ''} -->
	<Alert color="yellow" class='-mb-3'>
	  5 people ahead of you. Please wait a moment!
	</Alert>
  <!-- {/if} -->
  