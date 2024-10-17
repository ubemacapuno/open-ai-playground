import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to the pdf.js file in pdf.js-extract
const dir = join(__dirname, 'node_modules', 'pdf.js-extract', 'lib', 'pdfjs', 'pdf.js')

// Read the content of the pdf.js file
const content = readFileSync(dir, { encoding: 'utf-8' })

// Replace the line that causes the error
writeFileSync(
	dir,
	content.replace('"./pdf.worker.js";', `new URL("pdf.worker.js", import.meta.url).pathname`)
)

console.log('PDF.js file updated successfully.')
