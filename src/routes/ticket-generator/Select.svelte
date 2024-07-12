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

<style>
	.select_wrapper {
		--placeholder-color: var(--placeholder-color);
		--background: var(--bg-color);
		--padding: 0 var(--gap-small);
		--input-padding: 0;
		--border: 1px solid var(--input-border-color);
		--border-radius: var(--input-radius);
		--border-radius-focused: var(--input-radius);
		--border-hover: 1px solid var(--hover-color);
		--border-focused: 1px solid var(--hover-color);
		--font-size: var(--font-normal);
		--item-hover-bg: var(--hover-color);
		--item-is-active-bg: var(--hover-color);
		--item-active-background: var(--hover-color);
		--item-is-active-color: var(--title-color);
		--list-background: var(--modal-color);
		--list-border: 1px solid var(--input-border-color);
		--list-border-radius: var(--input-radius);
		--list-shadow: var(--button-border-color) 0 0 1px;
		--multi-item-color: inherit;
		--multi-item-bg: transparent;
		--multi-item-outline: none;
		--multi-item-height: 1;
		--multi-select-input-padding: var(--gap-xsmall);
		--multi-select-input-margin: 0;
		--multi-select-padding: 0 var(--gap-small);
		--multi-item-padding: 0;
		--multi-item-border-radius: var(--circle-radius);
		--width: 100%;
		--item-padding: 0 var(--gap-xsmall);
		--height: 2.2rem;
		--icons-color: var(--text-color);
		--clear-select-width: 16px;
		--clear-select-height: 16px;
		--chevron-width: 16px;
		--chevron-height: 16px;
		--spinner-height: 16px;
		--spinner-width: 16px;
		--item-is-not-selectable-color: var(--disabled-color);
		--disabled-background: transparent;
		--disabled-border-color: var(--disabled-color);
		--disabled-color: var(--disabled-color);
	}
</style>
