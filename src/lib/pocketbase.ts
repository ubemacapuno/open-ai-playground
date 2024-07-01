import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'

// Reference sample repo for pocketbase implementation @see https://github.com/jianyuan/pocketbase-sveltekit-auth

export function createInstance() {
	return new PocketBase(PUBLIC_POCKETBASE_URL)
}

export const pb = createInstance()
