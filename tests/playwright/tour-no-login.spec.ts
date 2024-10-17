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
})

test.describe('Homepage tour', () => {
	test('test elements on homepage', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByTestId('homepage-btn')).toHaveCount(1)
		await page.getByTestId('homepage-btn').click()
		await expect(page.getByTestId('bug-ticket-navigate')).toHaveCount(1)
		await expect(page.getByTestId('pdf-drawing-navigate')).toHaveCount(1)
		await page.getByTestId('bug-ticket-navigate').click()
		await page.getByTestId('pdf-drawing-navigate').click()
	})
})
