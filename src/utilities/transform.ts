import startCase from 'lodash.startcase'
import camelCase from 'lodash.camelcase'

export function toTitleCase(str: string = '') {
	// if string is below the numberToCapitalize then capitalize the whole string
	return startCase(camelCase(str))
}
