import { type VariantProps, tv } from 'tailwind-variants'

import Root from './alert.svelte'
import Description from './alert-description.svelte'
import Title from './alert-title.svelte'

export const alertVariants = tv({
	base: 'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
	variants: {
		variant: {
			default: 'bg-background text-foreground',
			destructive:
				'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
			caution: 'border-caution/50 text-caution dark:border-caution [&>svg]:text-caution'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
})

export type Variant = VariantProps<typeof alertVariants>['variant']
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export {
	Root,
	Description,
	Title,
	//
	Root as Alert,
	Description as AlertDescription,
	Title as AlertTitle
}
