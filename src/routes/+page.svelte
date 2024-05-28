<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { writable } from 'svelte/store'
	import Pdf from '$lib/components/PDF.svelte'
	import { toTitleCase } from '../utilities/transform'
	import * as Card from '$lib/components/ui/card'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import StepEmbed from '$lib/components/StepEmbed.svelte'
	import CallToAction from '$lib/components/CallToAction.svelte'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

	type PdfData = {
		part_number: string
		description: string
		revision: string
		operations: string[]
	}

	// PDF Vars
	let fileInput: HTMLInputElement
	let fileName = ''
	let accept: string = '.pdf'
	let pdfData = writable<PdfData>({
		part_number: '',
		description: '',
		revision: '',
		operations: []
	})
	let isProcessing = false
	let src = ''
	let modelLoaded = false

	// 3D Model Vars
	let modelFileName = ''
	const fileTypes = '.stp, .step'

	const onPdfFileUpload = async (file: File) => {
		const formData = new FormData()
		formData.append('file', file)
		isProcessing = true
		const response = await fetch('/api/pdf-processor', {
			method: 'POST',
			body: formData
		})
		if (response.ok) {
			// TODO: Show toast ?
			const result = await response.json()
			if (typeof result.data === 'string') {
				pdfData.set(JSON.parse(result.data))
			} else {
				pdfData.set(result.data)
			}
			isProcessing = false
		} else {
			console.error('Failed to upload and process PDF:', await response.text()) // TODO: Show toast
			isProcessing = false
		}
	}

	function onPdfFilesChange(event: Event) {
		const input = event.target as HTMLInputElement
		const currentFiles = Array.from(input?.files ?? [])
		onPdfFileUpload(currentFiles[0])
		src = URL.createObjectURL(currentFiles[0])
		input.value = ''
		fileName = currentFiles[0].name
	}

	$: hasValidPdfData =
		$pdfData.part_number.trim() !== '' ||
		$pdfData.description.trim() !== '' ||
		$pdfData.revision.trim() !== '' ||
		$pdfData.operations.length > 0

	// TODO: Use this example data for testing (Ex. when you don't want to hit the OpenAI API)
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

<CallToAction />
<div class="mx-auto flex flex-col items-center">
	<div class="pt-4">
		<Button on:click={() => fileInput.click()}>Import PDF</Button>
	</div>
</div>
<input on:change={onPdfFilesChange} multiple bind:this={fileInput} type="file" hidden {accept} />
{#if isProcessing}
	<div class="flex justify-center items-start h-screen py-12">
		<LoadingSpinner />
	</div>
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
<div class="pt-12">
	<StepEmbed displayName={modelFileName} />
</div>
