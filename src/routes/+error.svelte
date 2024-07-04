<script lang="ts">
	import { page } from '$app/stores'
	import CircleAlert from 'lucide-svelte/icons/circle-alert'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import Button from '$lib/components/ui/button/button.svelte'
</script>

<Alert.Root variant="destructive" class="mt-2">
	<CircleAlert class="h-4 w-4" />
	<Alert.Title>{$page.status.toString() || 'Error'}</Alert.Title>
	<Alert.Description>{$page.error?.message || 'Error'}</Alert.Description>
</Alert.Root>

<section class="mx-auto flex max-w-[980px] flex-col items-center gap-2 pt-8 pb-2 md:pt-12 lg:pt-24">
	<Button href="/">Go Home</Button>
</section>
