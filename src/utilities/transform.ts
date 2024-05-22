import startCase from 'lodash.startcase'
import camelCase from 'lodash.camelcase'

export function toTitleCase(str: string = '', numberToCapitalize = 3) {
	// if string is below the numberToCapitalize then capitalize the whole string
	if (str?.length <= numberToCapitalize) {
		return str.toUpperCase()
	}
	return startCase(camelCase(str))
}
