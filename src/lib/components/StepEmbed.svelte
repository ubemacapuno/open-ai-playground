<script lang="ts">
	import * as THREE from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { onMount } from 'svelte'
	import { cleanupMaterial, loadStepUsingWorker } from '../../utilities/step-helpers'

	export let src = ''
	export let displayName = ''

	// STEP Colors
	const edgeColor = 0x333333
	const lightingColor = 0xffffff
	const modeColors = { light: 0xd9e7fc, dark: 0x232323 }

	let container: HTMLElement
	let isModelLoading = true
	let errorMessage = ''
	let debouncedResize: (...args: any[]) => void
	let currentBackgroundColor = modeColors.dark

	// Three.js vars
	let model: THREE.Object3D<THREE.Object3DEventMap>
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let controls: OrbitControls
	let viewSize: number

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

	function toggleLightDarkMode() {
		currentBackgroundColor =
			currentBackgroundColor === modeColors.light ? modeColors.dark : modeColors.light

		if (renderer) {
			renderer.setClearColor(currentBackgroundColor)
			renderer.render(scene, camera) // re-render scene
		}
	}

	function debounce(func: (...args: any[]) => void, timeout = 300) {
		let timer: number | undefined
		return (...args: any[]) => {
			clearTimeout(timer)
			timer = setTimeout(() => {
				func.apply(this, args)
			}, timeout)
		}
	}

	function resetCamera() {
		if (!model || !camera) return
		const boundingBox = new THREE.Box3().setFromObject(model)
		adjustCamera(boundingBox)
		controls?.target.copy(boundingBox.getCenter(new THREE.Vector3())) // Center the model
		controls?.update()
	}

	async function initScene() {
		console.log('initScene Hit')
		if (!src || !container) {
			console.log('No source provided for STEP file or container is not ready.')
			return
		}

		console.log('Initializing scene for:', src)

		try {
			scene = new THREE.Scene()
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000)
			renderer = new THREE.WebGLRenderer({ antialias: true })
			renderer.setSize(container.clientWidth, container.clientHeight)
			container.appendChild(renderer.domElement)
			renderer.setClearColor(currentBackgroundColor)

			const response = await fetch(src)
			if (!response.ok) throw new Error('Failed to fetch the file')

			const arrayBuffer = await response.arrayBuffer()
			const model = await loadStepUsingWorker(arrayBuffer)
			console.log('initScene model:', model)

			console.log('model in initScene:', model)
			if (model) {
				isModelLoading = false
				errorMessage = ''
				scene.add(model)
				const boundingBox = new THREE.Box3().setFromObject(model)
				model.position.sub(boundingBox.getCenter(new THREE.Vector3()))

				//
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
		} catch (error) {
			console.error('Error initializing Three.js scene: ', error)
			isModelLoading = false
			errorMessage = error as string
		}
	}

	onMount(() => {
		if (container) {
			initScene()
		}

		return () => {
			window.removeEventListener('resize', debouncedResize)

			// Traverse scene and clean up materials and geometries
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					object.geometry.dispose()

					if (Array.isArray(object.material)) {
						object.material.forEach((material) => {
							if (material instanceof THREE.Material) {
								cleanupMaterial(material)
							}
						})
					} else if (object.material instanceof THREE.Material) {
						cleanupMaterial(object.material)
					}
				}
			})

			if (controls) {
				controls.dispose()
			}

			if (renderer) {
				renderer.dispose()
				if (container && renderer.domElement.parentNode === container) {
					container.removeChild(renderer.domElement)
				}
			}
		}
	})

	$: if (src && container) {
		initScene()
	}
</script>

<div class="model_container" bind:this={container}></div>

<style>
	.model_container {
		height: 1000px;
		width: 1000px;
		position: relative;
		border: 1px solid red;
	}
</style>
