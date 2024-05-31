import type { PdfData } from './pdf_processor_types'

// Example data for testing
export const examplePdfData: PdfData = {
	part_number: '0036',
	description: 'SP Base Plate',
	revision: 'J',
	operations: [
		'Laser marking',
		'Anodizing',
		'Bead blasting',
		'Heat treating',
		'Powder coating',
		'CNC milling',
		'Electroplating',
		'Polishing'
	]
}
