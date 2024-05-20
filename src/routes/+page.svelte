<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import Pdf from '$lib/components/PDF.svelte';
	import { toTitleCase } from '../utilities/transform';
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import ThreeDEmbed from '$lib/components/ThreeDEmbed.svelte';

	type PdfData = {
		part_number: string;
		description: string;
		revision: string;
		operations: string[];
	};

	// PDF Vars
	let fileInput: HTMLInputElement;
	let fileName = '';
	let accept: string = '.pdf';
	let pdfData = writable<PdfData>({
		part_number: '',
		description: '',
		revision: '',
		operations: []
	});
	let isProcessing = false;
	let src = '';

	// 3D Model Vars
	let modelSrc = '';
	let modelFileInput: HTMLInputElement;
	let modelFileName = '';
	const fileTypes =
		'.3dm,.3ds,.3mf,.amf,.bim,.brep,.dae,.fbx,.FCStd,.gltf,.glb,.ifc,.iges,.step,.stl,.obj,.off,.ply,.wrl';

	const onPdfFileUpload = async (file: File) => {
		console.log('HIT');
		const formData = new FormData();
		formData.append('file', file);
		isProcessing = true;
		const response = await fetch('/api/pdf-processor', {
			method: 'POST',
			body: formData
		});
		if (response.ok) {
			const result = await response.json();
			console.log('API Response:', result);
			if (typeof result.data === 'string') {
				pdfData.set(JSON.parse(result.data));
			} else {
				pdfData.set(result.data);
			}
			isProcessing = false;
		} else {
			console.error('Failed to upload and process PDF:', await response.text());
			isProcessing = false;
		}
	};

	const handleModelFileUpload = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const fileExtension = file.name.split('.').pop();
			modelFileName = file.name;
			modelSrc = URL.createObjectURL(file) + '#.' + fileExtension;
			input.value = '';
		}
	};

	function onPdfFilesChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const currentFiles = Array.from(input?.files ?? []);
		currentFiles.forEach((file) => {
			onPdfFileUpload(file);
		});
		src = URL.createObjectURL(currentFiles[0]);
		input.value = '';
		fileName = currentFiles[0].name;
	}

	$: hasValidPdfData =
		$pdfData.part_number.trim() !== '' ||
		$pdfData.description.trim() !== '' ||
		$pdfData.revision.trim() !== '' ||
		$pdfData.operations.length > 0;

	// const examplePdfData: PdfData = {
	// 	part_number: '0036',
	// 	description: 'SP Base Plate',
	// 	revision: 'J',
	// 	operations: [
	// 		'Laser marking',
	// 		'Anodizing',
	// 		'Bead blasting',
	// 		'Heat treating',
	// 		'Powder coating',
	// 		'CNC milling',
	// 		'Electroplating',
	// 		'Polishing'
	// 	]
	// };
</script>

<Button on:click={() => fileInput.click()} variant="outline">Import PDF Drawing</Button>
<input on:change={onPdfFilesChange} multiple bind:this={fileInput} type="file" hidden {accept} />
{#if isProcessing}
	<p>Processing...</p>
{/if}

{#if hasValidPdfData}
	<div class="my-4 flex items-start justify-between gap-4">
		<Card.Root class="max-w-lg rounded-lg p-4 shadow-md">
			<Card.Header>
				<Card.Title>{$pdfData.part_number}</Card.Title>
				<Card.Description>{$pdfData.description}</Card.Description>
				<Card.Description
					>{$pdfData.revision ? `Revision ${$pdfData.revision}` : ''}</Card.Description
				>
			</Card.Header>
			<Card.Content>
				{#if $pdfData.operations && $pdfData.operations.length > 0}
					<div class="my-1">
						<ul class="flex flex-wrap">
							{#each $pdfData.operations as operation}
								<li class="m-1/2">
									<Badge class="mx-1">{toTitleCase(operation)}</Badge>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
		<Pdf {src} {fileName} />
	</div>
{/if}

<Button on:click={() => modelFileInput.click()} variant="outline">Import Model</Button>
<input
	type="file"
	accept={fileTypes}
	on:change={handleModelFileUpload}
	bind:this={modelFileInput}
	style="display: none;"
/>
<ThreeDEmbed {modelSrc} {modelFileName} />
