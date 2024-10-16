const fs = require('fs')

// Path to the pdf.js file in pdf.js-extract
const dir = 'node_modules/pdf.js-extract/lib/pdfjs/pdf.js'

// Read the content of the pdf.js file
const content = fs.readFileSync(dir, { encoding: 'utf-8' })

// Replace the line that causes the error
fs.writeFileSync(dir, content.replace('"./pdf.worker.js";', `__dirname + "/pdf.worker.js";`))
