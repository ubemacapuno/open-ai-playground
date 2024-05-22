import * as THREE from 'three'

export function cleanupMaterial(material: THREE.Material) {
	material.dispose()

	const textureProperties = [
		'map',
		'lightMap',
		'bumpMap',
		'normalMap',
		'specularMap',
		'envMap',
		'alphaMap',
		'aoMap',
		'displacementMap',
		'emissiveMap',
		'gradientMap',
		'metalnessMap',
		'roughnessMap',
		'transmissionMap',
		'opacityMap'
	]

	// loop and dispose of textures
	textureProperties.forEach((prop) => {
		const texture = (material as any)[prop] as THREE.Texture | undefined
		if (texture instanceof THREE.Texture) {
			texture.dispose()
		}
	})
}

// function to process a STEP file outside the main thread using a Web Worker
// Assuming loadStepUsingWorker is modified to accept ArrayBuffer
export function loadStepUsingWorker(fileData: ArrayBuffer): Promise<THREE.Object3D> {
	console.log('Loading STEP file using Web Worker with ArrayBuffer...')
	return new Promise((resolve, reject) => {
		const worker = new Worker(new URL('./step-worker.ts', import.meta.url), { type: 'module' })

		worker.onmessage = ({ data }) => {
			if (data.error) {
				console.error('Error in Web Worker: ' + data.error)
				reject(new Error('Error in Web Worker: ' + data.error))
				return
			}

			const loader = new THREE.ObjectLoader()
			const scene = loader.parse(data.geometryData) // parse JSON to a Three.js object
			resolve(scene)
		}

		worker.onerror = (err) => {
			console.error('Worker error received: ', err)
			reject(new Error('Error in Web Worker: ' + err.message))
		}

		console.log('fileData fromn loadStepUsingWorker:', fileData)
		worker.postMessage({ fileData }) // Sending ArrayBuffer directly
	})
}
