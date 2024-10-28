<script lang="ts">
	import TopNav from '$lib/components/TopNav.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import '../app.css'
	import { currentUser } from '$lib/stores/user'
	import type { PageData } from './$types'
	import Footer from '$lib/components/Footer.svelte'

	export let data: PageData

	// Set the current user from the data passed in from the server
	$: currentUser.set(data.user)
</script>

<Toaster expand richColors closeButton />
<TopNav />
<div class="bg-background relative flex min-h-screen flex-col mx-2">
	<slot />
</div>
<Footer />
