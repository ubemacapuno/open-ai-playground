<script lang="ts">
	import * as THREE from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { onMount } from 'svelte'
	import { cleanupMaterial, loadStepUsingWorker } from '../../utilities/step-helpers'
	import { Button } from '$lib/components/ui/button'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

	export let displayName = ''

	// STEP Colors
	const edgeColor = 0x333333
	const lightingColor = 0xffffff
	const modeColors = { light: 0xd9e7fc, dark: 0x232323 }

	let container: HTMLElement
	let isModelLoading = false
	let errorMessage = ''
	let debouncedResize: (...args: any[]) => void
	let currentBackgroundColor = modeColors.dark

	// Three.js vars
	let model: THREE.Object3D<THREE.Object3DEventMap> | null
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let controls: OrbitControls
	let viewSize: number

	// 3D Model Vars
	let src = ''
	let modelFileInput: HTMLInputElement
	let modelFileName = ''
	let isModelRendered = false
	const fileTypes = '.stp, .step'

	function adjustCamera(boundingBox: THREE.Box3) {
		const size = boundingBox.getSize(new THREE.Vector3())
		viewSize = Math.max(size.x, size.y, size.z)

		// Set orthographic camera frustum
		const aspectRatio = container.clientWidth / container.clientHeight
		camera.left = (-aspectRatio * viewSize) / 2
		camera.right = (aspectRatio * viewSize) / 2
		camera.top = viewSize / 2
		camera.bottom = -viewSize / 2

		camera.near = -10000
		camera.far = 10000

		const center = boundingBox.getCenter(new THREE.Vector3())
		camera.position.set(center.x, center.y, center.z + viewSize)
		camera.lookAt(center)
		camera.updateProjectionMatrix() // called for camera changes to take effect
	}

	// Resize the renderer when the window is resized
	function onWindowResize() {
		if (camera && renderer && container) {
			const aspect = container.clientWidth / container.clientHeight

			camera.left = (-aspect * viewSize) / 2
			camera.right = (aspect * viewSize) / 2
			camera.top = viewSize / 2
			camera.bottom = -viewSize / 2

			camera.updateProjectionMatrix()
			renderer.setSize(container.clientWidth, container.clientHeight)
		}
	}

	// function toggleLightDarkMode() {
	// 	currentBackgroundColor =
	// 		currentBackgroundColor === modeColors.light ? modeColors.dark : modeColors.light

	// 	if (renderer) {
	// 		renderer.setClearColor(currentBackgroundColor)
	// 		renderer.render(scene, camera) // re-render scene
	// 	}
	// }

	function debounce(func: (...args: any[]) => void, timeout = 300) {
		let timer: number | undefined
		return (...args: any[]) => {
			clearTimeout(timer)
			timer = setTimeout(() => {
				func.apply(this, args)
			}, timeout)
		}
	}

	// function resetCamera() {
	// 	if (!model || !camera) return
	// 	const boundingBox = new THREE.Box3().setFromObject(model)
	// 	adjustCamera(boundingBox)
	// 	controls?.target.copy(boundingBox.getCenter(new THREE.Vector3())) // Center the model
	// 	controls?.update()
	// }

	async function initScene() {
		if (!src || !container) {
			return
		}

		try {
			isModelLoading = true

			scene = new THREE.Scene()
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
			renderer = new THREE.WebGLRenderer({ antialias: true })
			renderer.setSize(container.clientWidth, container.clientHeight)
			container.appendChild(renderer.domElement)
			renderer.setClearColor(currentBackgroundColor)

			const response = await fetch(src)
			if (!response.ok) throw new Error('Failed to fetch the file')

			const arrayBuffer = await response.arrayBuffer()
			model = await loadStepUsingWorker(arrayBuffer)

			if (model) {
				isModelLoading = false
				errorMessage = ''
				scene.add(model)
				const boundingBox = new THREE.Box3().setFromObject(model)
				model.position.sub(boundingBox.getCenter(new THREE.Vector3()))

				model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						const edges = new THREE.EdgesGeometry(child.geometry)
						const edgeLine = new THREE.LineSegments(
							edges,
							new THREE.LineBasicMaterial({ color: edgeColor, linewidth: 1 })
						)
						child.add(edgeLine)
					}
				})

				adjustCamera(boundingBox)

				const ambientLight = new THREE.AmbientLight(lightingColor)
				const directionalLight = new THREE.DirectionalLight(lightingColor, 1.0)
				directionalLight.position.set(5, 5, 5)
				scene.add(ambientLight, directionalLight)

				controls = new OrbitControls(camera, renderer.domElement)
				;(function animate() {
					requestAnimationFrame(animate)
					controls.update()
					renderer.render(scene, camera)
				})()
			}

			debouncedResize = debounce(onWindowResize, 1800) // Resize after 1.8s
			window.addEventListener('resize', debouncedResize)
			onWindowResize()
			isModelLoading = false
			isModelRendered = true
		} catch (error) {
			console.error('Error initializing Three.js scene: ', error)
			isModelLoading = false
			errorMessage = error as string
		}
	}

	const handleModelFileUpload = (event: Event) => {
		const input = event.target as HTMLInputElement
		if (input.files && input.files[0]) {
			const file = input.files[0]

			modelFileName = file.name
			src = URL.createObjectURL(file)
			input.value = ''
		}
	}

	function removeModel() {
		if (model && scene) {
			scene.remove(model)
			model.traverse((object) => {
				// Cleanup materials and geometries
				if (object instanceof THREE.Mesh) {
					object.geometry.dispose()
					if (Array.isArray(object.material)) {
						object.material.forEach(cleanupMaterial)
					} else if (object.material instanceof THREE.Material) {
						cleanupMaterial(object.material)
					}
				}
			})
			container.removeChild(renderer.domElement)

			model = null
			console.log('Model removed') // Show in toast
		} else {
			console.log('No model to remove') // Show in toast
		}
		if (controls) {
			controls.dispose()
		}
		if (renderer) {
			renderer.dispose()
		}

		errorMessage = ''
		isModelRendered = false
	}

	onMount(() => {
		if (container) {
			initScene()
		}

		return () => {
			window.removeEventListener('resize', debouncedResize)
			removeModel()
		}
	})

	$: if (src && container) {
		initScene()
	}
</script>

<div
	class="h-[80vh] w-full relative my-2"
	class:border-2={!isModelRendered}
	class:border-dashed={!isModelRendered}
	class:border-orange-400={!isModelRendered}
	bind:this={container}
>
	{#if isModelLoading}
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<LoadingSpinner />
		</div>
	{/if}
	{#if !isModelRendered && !isModelLoading}
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<Button
				on:click={() => {
					modelFileInput.click()
				}}
				variant="outline"
			>
				Import STEP
			</Button>
		</div>
	{:else}
		<div class="absolute top-1 right-1">
			<Button variant="outline" on:click={removeModel}>Clear</Button>
		</div>
	{/if}
	{#if displayName}
		<div class="absolute top-1/2 right-1/2 transform -translate-x-1/2 -translate-y-1/2 border-">
			<p>
				{displayName}
			</p>
		</div>
	{/if}
	{#if errorMessage}
		<p class="text-red-500">{errorMessage}</p>
	{/if}
	<input
		type="file"
		accept={fileTypes}
		on:change={handleModelFileUpload}
		bind:this={modelFileInput}
		hidden
	/>
</div>
