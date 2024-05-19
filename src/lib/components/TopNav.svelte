<script>
	import { ModeWatcher } from 'mode-watcher';
	import LightSwitch from './LightSwitch.svelte';
</script>

<div class="flex items-center justify-between">
	<nav class="flex items-center gap-6 text-sm">
		<a href="/" class="mr-6 flex items-center space-x-2">
			<span class="hidden font-bold sm:inline-block">Parse</span>
		</a>
		<a href="/model-viewer" class="text-foreground/60">Viewer</a>
	</nav>
	<div>
		<LightSwitch />
		<ModeWatcher />
	</div>
</div>
