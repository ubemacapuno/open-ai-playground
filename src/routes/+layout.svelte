<script>
	import TopNav from '$lib/components/TopNav.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import '../app.css'
</script>

<Toaster expand richColors closeButton />
<TopNav />
<div class="mx-4">
	<slot />
</div>
