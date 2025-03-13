import { test, expect } from '@playwright/test'

test.describe('Tour - No Auth, redirect to Login', () => {
	test.afterEach(async ({ page }) => {
		await expect(page).toHaveTitle('OpenAI Playground')
		await expect(page.getByTestId('login-card')).toHaveCount(1)
		await page.goto('/')
	})

	test('Redirect to Login (/ticket-generator)', async ({ page }) => {
		await page.goto('/ticket-generator')
	})

	test('Redirect to Login (/pdf-drawing)', async ({ page }) => {
		await page.goto('/pdf-drawing')
	})

	test('Redirect to Login (/tube)', async ({ page }) => {
		await page.goto('/tube')
	})
})

test.describe('Homepage tour', () => {
	test('test elements on homepage', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByTestId('homepage-btn')).toHaveCount(1)
		await page.getByTestId('homepage-btn').click()
		await expect(page.getByTestId('bug-ticket-link')).toHaveCount(1)
		await expect(page.getByTestId('video-assistant-link')).toHaveCount(1)
		await expect(page.getByTestId('pdf-drawing-link')).toHaveCount(1)
	})
})

test('Theme toggle functionality', async ({ page }) => {
	await page.goto('/')

	// get the current theme from 'mode-watcher-mode' in local storage
	const getTheme = async () => {
		return await page.evaluate(() => {
			return localStorage.getItem('mode-watcher-mode')
		})
	}

	// check initial theme is default 'dark'
	let initialTheme = await getTheme()
	expect(initialTheme).toBe('dark')

	// find the theme toggle button
	const themeToggle = page.getByRole('button', { name: 'Toggle theme' })

	// check if the Moon icon is present for dark mode
	let moonIcon = await page.getByRole('img', { name: 'moon' }).isVisible()
	expect(moonIcon).toBe(true)

	// click the theme toggle button
	await themeToggle.click()

	// check if the theme has changed in local storage - expect it to be 'light'
	let newTheme = await getTheme()
	expect(newTheme).toBe('light')

	// check if the Sun icon is present for light mode
	let sunIcon = await page.getByRole('img', { name: 'sun' }).isVisible()
	expect(sunIcon).toBe(true)

	// toggle again
	await themeToggle.click()

	// Check if the theme has changed back to 'dark'
	newTheme = await getTheme()
	expect(newTheme).toBe('dark')

	// check if the Moon icon is back for dark mode
	moonIcon = await page.getByRole('img', { name: 'moon' }).isVisible()
	expect(moonIcon).toBe(true)
})
