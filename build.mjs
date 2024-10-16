// This file is needed when deploying to Vercel
// @see https://stackoverflow.com/questions/74282002/using-pdfjs-dist-on-vercel-serverless-function
const fs = require('fs')
const dir = 'node_modules/pdfjs-dist/es5/build/pdf.js'
const content = fs.readFileSync(dir, { encoding: 'utf-8' })
fs.writeFileSync(dir, content.replace('"./pdf.worker.js";', `__dirname + "/pdf.worker.js";`))
