<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ThreeDEmbed from '$lib/components/ThreeDEmbed.svelte';

	let fileUrl = '';
	let fileInput: HTMLInputElement;

	const fileTypes =
		'.3dm,.3ds,.3mf,.amf,.bim,.brep,.dae,.fbx,.FCStd,.gltf,.glb,.ifc,.iges,.step,.stl,.obj,.off,.ply,.wrl';

	const handleFileUpload = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const fileExtension = file.name.split('.').pop();
			fileUrl = URL.createObjectURL(file) + '#.' + fileExtension;
			input.value = '';
		}
	};
</script>

<Button on:click={() => fileInput.click()} variant="outline">Import</Button>
<input
	type="file"
	accept={fileTypes}
	on:change={handleFileUpload}
	bind:this={fileInput}
	style="display: none;"
/>
<ThreeDEmbed src={fileUrl} />
