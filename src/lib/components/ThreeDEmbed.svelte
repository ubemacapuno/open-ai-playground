<script lang="ts">
	import * as OV from 'online-3d-viewer';
	import { onMount, onDestroy } from 'svelte';

	export let modelSrc = '';
	export let modelFileName = '';

	let modelViewer: OV.EmbeddedViewer;
	let modifiedModelSrc = '';

	onMount(() => {
		OV.SetExternalLibLocation('/3dmodelViewer_libs');
		const parentDiv = document.getElementById('modelViewer');

		modelViewer = new OV.EmbeddedViewer(parentDiv!, {
			camera: new OV.Camera(
				new OV.Coord3D(100, 100, 100),
				new OV.Coord3D(0.0, 0.0, 0.0),
				new OV.Coord3D(0.0, 1.0, 0.0),
				45.0
			),
			backgroundColor: new OV.RGBAColor(162, 160, 172, 255),
			defaultColor: new OV.RGBColor(200, 200, 200),
			edgeSettings: new OV.EdgeSettings(true, new OV.RGBColor(28, 28, 28), 5),
			environmentSettings: new OV.EnvironmentSettings([], false)
		});
	});

	onDestroy(() => {
		modelViewer?.Destroy();
	});

	$: if (modelSrc) {
		const fileExtension = modelSrc.split('.').pop();
		modifiedModelSrc = `${modelSrc}#.${fileExtension}`;
		if (modelViewer) {
			modelViewer.LoadModelFromUrlList([modifiedModelSrc]);
		}
	}
</script>

<div class="relative mb-4 h-[calc(100vh-10rem)] w-full">
	{#if modelSrc}
		<div
			class="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-gray-600 bg-opacity-90 p-1 text-white"
		>
			<h3 class="truncate">{modelFileName}</h3>
		</div>
	{/if}
	<div id="modelViewer" class="my-4 h-full w-full" />
</div>
