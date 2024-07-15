<div class="loader"></div>

<style>
	.loader {
		font-weight: bold;
		font-family: monospace;
		font-size: 30px;
		display: inline-grid;
		color: #fb923c;
	}
	.loader:before,
	.loader:after {
		content: 'Thinking...';
		grid-area: 1/1;
		line-height: 1em;
		-webkit-mask: linear-gradient(90deg, #000 50%, #0000 0) 0 50%/2ch 100%;
		-webkit-mask-position: calc(var(--s, 0) * 1ch) 50%;
		animation: l30 2s infinite;
	}
	.loader:after {
		--s: -1;
	}
	@keyframes l30 {
		33% {
			transform: translateY(calc(var(--s, 1) * 50%));
			-webkit-mask-position: calc(var(--s, 0) * 1ch) 50%;
		}
		66% {
			transform: translateY(calc(var(--s, 1) * 50%));
			-webkit-mask-position: calc(var(--s, 0) * 1ch + 1ch) 50%;
		}
		100% {
			transform: translateY(calc(var(--s, 1) * 0%));
			-webkit-mask-position: calc(var(--s, 0) * 1ch + 1ch) 50%;
		}
	}
</style>
