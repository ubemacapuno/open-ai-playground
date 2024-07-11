<script lang="ts">
	import Select from 'svelte-select'
	import { createEventDispatcher } from 'svelte'

	export let items = []
	export let value: any
	export let placeholder = 'Choose an option'
	export let disabled = false
	export let clearable = false

	const dispatch = createEventDispatcher()

	function handleChange(event) {
		dispatch('change', event.detail)
	}
</script>

<div class="select_wrapper">
	<Select {items} bind:value {placeholder} {disabled} {clearable} on:change={handleChange}>
		<div slot="item" let:item>
			{item.label}
		</div>

		<div slot="selection" let:selection>
			{selection.label}
		</div>
		<div slot="empty" class="padding center_text">
			<p>No Options Available</p>
		</div>
	</Select>
</div>
