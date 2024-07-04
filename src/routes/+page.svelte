<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
</script>

<section class="mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-8 pb-2 md:pt-12 lg:pt-24">
	<h1
		class="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]"
	>
		OpenAI API Apps
	</h1>

	<Button href="/pdf-drawing">PDF Drawing Parser</Button>

	<Button href="/ticket-generator">Bug Ticket Generator</Button>
</section>
