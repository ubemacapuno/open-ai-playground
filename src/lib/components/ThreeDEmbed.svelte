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

<div class="viewer_container">
	<div class="display_name_container max_width">
		<h3 class="truncate_text">Viewer</h3>
	</div>
	<div id="viewer" />
</div>

<style lang="postcss">
	.viewer_container {
		position: relative;
		height: 100%;
		width: 100%;
	}

	.display_name_container {
		position: absolute;
		top: var(--gap_smallest);
		right: var(--gap_smallest);
		z-index: calc(var(--modal_level) + 1);
		background-color: hsla(0, 0%, 10%, 70%);
		border-radius: var(--border_radius);
		padding: var(--gap_smallest);
	}

	#viewer {
		height: 100%;
		width: 100%;
	}
</style>
