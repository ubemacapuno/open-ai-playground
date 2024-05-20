<script lang="ts">
	import { page } from '$app/stores';
	import LightSwitch from './LightSwitch.svelte';
	import { ModeWatcher } from 'mode-watcher';

	let activeRoute = '';

	$: activeRoute = $page.url.pathname;
</script>

<div
	class="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-border bg-card bg-opacity-75 px-4 text-card-foreground backdrop-blur-lg backdrop-filter"
>
	<span class="hidden font-bold sm:inline-block">ProtoParser 3D</span>
	<div>
		<LightSwitch />
		<ModeWatcher defaultMode={'dark'} />
	</div>
</div>
