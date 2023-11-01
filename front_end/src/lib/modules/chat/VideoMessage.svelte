<script lang="ts">
	export let src: string;
</script>

<video controls class="w-[40vw] sm:w-[15vw]">
	<source {src} type="video/mp4" />
	Your browser does not support the video tag.
</video>
