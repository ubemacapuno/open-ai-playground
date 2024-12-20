import Record from 'pocketbase'
import Admin from 'pocketbase'
import { writable } from 'svelte/store'

export const currentUser = writable<Record | Admin | null>()
