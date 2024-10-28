<script lang="ts">
	const siteConfig = {
		name: 'OpenAI Playground',
		url: 'https://ai-ssue.vercel.app/',
		description: 'Beautifully designed components built with Melt UI and Tailwind CSS.',
		links: {
			githubUser: 'https://github.com/ubemacapuno',
			githubRepo: 'https://github.com/ubemacapuno/open-ai-playground'
		},
		keywords: `shadcn,Svelte,SvelteKit,Svelte Components,TailwindCSS,Melt UI,Bit UI, OpenAI API`
	}
</script>

<footer class="py-2 md:px-8 md:py-0">
	<div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
		<div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
			<p class="text-muted-foreground text-center text-sm leading-loose md:text-left">
				Built & designed by
				<a
					href={siteConfig.links.githubUser}
					target="_blank"
					rel="noreferrer"
					class="font-medium underline underline-offset-4"
				>
					Corey</a
				>. The source code is available on
				<a
					href={siteConfig.links.githubRepo}
					target="_blank"
					rel="noreferrer"
					class="font-medium underline underline-offset-4"
				>
					GitHub</a
				>.
			</p>
		</div>
	</div>
</footer>
