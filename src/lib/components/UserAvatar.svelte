<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js'

	export let userImage: string | null = null
	export let userEmail: string | null = null

	function getGradientColors(char: string): [string, string] {
		const asciiCode = char.toLowerCase().charCodeAt(0)
		const hue1 = (asciiCode * 7) % 360
		const hue2 = (hue1 + 60) % 360
		return [`hsl(${hue1}, 70%, 50%)`, `hsl(${hue2}, 70%, 50%)`]
	}

	function getInitial(email: string): string {
		return email.charAt(0).toUpperCase()
	}

	function getContrastColor(color: string): 'black' | 'white' {
		const rgb = color.match(/\d+/g)
		if (!rgb) return 'white'
		const [r, g, b] = rgb.map(Number)
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 128 ? 'black' : 'white'
	}

	$: initial = userEmail ? getInitial(userEmail) : '?'
	$: [gradientStart, gradientEnd] = userEmail ? getGradientColors(initial) : ['#FFA500', '#FF8C00'] // Default orange
	$: textColor = getContrastColor(gradientStart)
</script>

<Avatar.Root>
	{#if userImage}
		<Avatar.Image src={userImage} alt="User avatar" />
	{:else}
		<Avatar.Fallback
			style="background: linear-gradient(135deg, {gradientStart}, {gradientEnd}); color: {textColor}; font-weight: bold;"
		>
			{initial}
		</Avatar.Fallback>
	{/if}
</Avatar.Root>
