<script lang="ts">
	import * as OV from 'online-3d-viewer';
	import { onMount, onDestroy } from 'svelte';

	export let src = '';

	let viewer: OV.EmbeddedViewer;
	let modifiedSrc = '';

	onMount(() => {
		OV.SetExternalLibLocation('/3dviewer_libs');
		const parentDiv = document.getElementById('viewer');

		viewer = new OV.EmbeddedViewer(parentDiv!, {
			camera: new OV.Camera(
				new OV.Coord3D(100, 100, 100),
				new OV.Coord3D(0.0, 0.0, 0.0),
				new OV.Coord3D(0.0, 1.0, 0.0),
				45.0
			),
			backgroundColor: new OV.RGBAColor(28, 28, 28, 255),
			defaultColor: new OV.RGBColor(200, 200, 200),
			edgeSettings: new OV.EdgeSettings(true, new OV.RGBColor(28, 28, 28), 5),
			environmentSettings: new OV.EnvironmentSettings([], false)
		});
	});

	onDestroy(() => {
		viewer?.Destroy();
	});

	$: if (src) {
		const fileExtension = src.split('.').pop();
		modifiedSrc = `${src}#.${fileExtension}`;
		if (viewer) {
			viewer.LoadModelFromUrlList([modifiedSrc]);
		}
	}
</script>

<div class="relative mb-4 h-[calc(100vh-4rem)] w-2/3">
	<div class="absolute right-1 top-1 z-10 rounded-lg bg-gray-800 bg-opacity-70 p-1">
		<h3 class="truncate">Viewer</h3>
	</div>
	<div id="viewer" class="h-full w-full" />
</div>
