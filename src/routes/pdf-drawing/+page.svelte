<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { writable } from 'svelte/store'
	import Pdf from '$lib/components/PDF.svelte'
	import { toTitleCase } from '../../utilities/transform'
	import * as Card from '$lib/components/ui/card'
	import Badge from '$lib/components/ui/badge/badge.svelte'
	import StepEmbed from '$lib/components/StepEmbed.svelte'
	import CallToAction from '$lib/components/CallToAction.svelte'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import { toast } from 'svelte-sonner'
	import type { PdfData } from '../api/pdf-processor/pdf_processor_types'
	import type { PageData } from './$types'
	import CircleAlert from 'lucide-svelte/icons/circle-alert'
	import * as Alert from '$lib/components/ui/alert/index.js'

	export let data: PageData

	$: ({ isProd } = data)

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

	// 3D Model Vars
	let modelFileName = ''
	let pdfDataInitialized = false

	const resetPdfData = () => {
		pdfData.set({
			part_number: '',
			description: '',
			revision: '',
			operations: []
		})
		src = ''
		fileName = ''
		pdfDataInitialized = false
	}

	const onPdfFileUpload = async (file: File) => {
		resetPdfData()
		const formData = new FormData()
		formData.append('file', file)
		formData.append('fileName', file.name)
		isProcessing = true
		const response = await fetch('/api/pdf-processor', {
			method: 'POST',
			body: formData
		})

		if (response.ok) {
			const result = await response.json()
			if (typeof result.data === 'string') {
				pdfData.set(JSON.parse(result.data))
			} else {
				pdfData.set(result.data)
			}
			isProcessing = false
			pdfDataInitialized = true
			toast.success('PDF Processed', {
				description: 'The PDF has been processed successfully.'
			})
		} else {
			isProcessing = false
			const errorResponse = await response.json()
			console.error('Failed to upload and process PDF:', errorResponse.error)
			toast.error('There was an error processing the PDF', {
				description: errorResponse.error || 'Unknown error occurred'
			})
		}
	}

	const importDemoPdf = async () => {
		const filePath = '/demo-pdf.PDF' // demo PDF location
		const response = await fetch(filePath)
		if (response.ok) {
			const blob = await response.blob()
			const file = new File([blob], 'demo-pdf.PDF', { type: 'application/pdf' })
			onPdfFileUpload(file)
			src = URL.createObjectURL(blob) // set src for the PDF component
			fileInput.value = ''
		} else {
			console.error('Failed to load demo PDF')
			toast.error('Failed to load demo PDF')
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
		(pdfDataInitialized && $pdfData.part_number.trim() !== '') ||
		$pdfData.description.trim() !== '' ||
		$pdfData.revision.trim() !== '' ||
		$pdfData.operations.length > 0
</script>

{#if isProd}
	<Alert.Root variant="caution" class="mt-2">
		<CircleAlert class="h-4 w-4" />
		<Alert.Title>The PDF drawing parser feature is currently unavailable in production.</Alert.Title
		>
		<Alert.Description>
			pdf.js-extract does not currently work in production due to Vercel serverless environment
			limitations. Please try this feature locally.
		</Alert.Description>
	</Alert.Root>
{/if}

<CallToAction />

<div class="mx-auto flex flex-col items-center">
	<div class="pt-4 pb-12">
		<Button on:click={() => fileInput.click()} disabled={isProd}>Import PDF</Button>
		<Button variant="outline" on:click={importDemoPdf} disabled={isProd}>Import Demo PDF</Button>
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
				<Card.Title>{$pdfData.part_number ? `Part Number: ${$pdfData.part_number}` : ''}</Card.Title
				>
				<Card.Description
					>{$pdfData.description ? `Name: ${$pdfData.description}` : ''}</Card.Description
				>
				<Card.Description
					>{$pdfData.revision ? `Revision: ${$pdfData.revision}` : ''}</Card.Description
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
