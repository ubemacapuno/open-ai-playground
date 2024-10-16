import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'
import type { RequestEvent } from '@sveltejs/kit'
import type { TransitionConfig } from 'svelte/transition'
import type { TicketData } from '../routes/ticket-generator/ticket-generator-types'

// This file is a collection of utility functions that can be used in any Svelte component or server route.

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type FlyAndScaleParams = {
	y?: number
	x?: number
	start?: number
	duration?: number
}

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node)
	const transform = style.transform === 'none' ? '' : style.transform

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, '')
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			})
		},
		easing: cubicOut
	}
}

// Helper function to redirect the user to the login page with a message
export function handleLoginRedirect(
	event: RequestEvent,
	message: string = 'You must be logged in to access this page'
) {
	const redirectTo = event.url.pathname + event.url.search
	return `/login?redirectTo=${redirectTo}&message=${encodeURIComponent(message)}`
}

// Utility function to map RecordModel to TicketData
export function mapRecordToTicketData(record: any): TicketData {
	return {
		id: record.id,
		title: record.title,
		description: record.description,
		acceptance_criteria: record.acceptance_criteria || [],
		steps_to_reproduce: record.steps_to_reproduce || [],
		technical_notes: record.technical_notes || [],
		priority: record.priority,
		labels: record.labels || [],
		assignee: record.assignee,
		status: record.status
	}
}
