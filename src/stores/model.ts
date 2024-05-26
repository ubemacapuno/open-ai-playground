import { writable } from 'svelte/store'

export const modelStore = writable({ url: '', shouldReset: false })
