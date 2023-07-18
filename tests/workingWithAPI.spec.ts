import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach( async({page}) => {
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })


  await page.goto('https://angular.realworld.io/');
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('pwtest@test.com')
  await page.getByRole('textbox', {name: 'Password'}).fill('Welcome1')
  await page.getByRole('button').click()
})

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK desctiption"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK desctiption')
});

test('delete artice', async({page, request}) => {
  const response = await request.post('https://api.realworld.io/api/users/login', {
    data: {
      "user":{"email":"pwtest@test.com","password":"Welcome1"}
    }
  })
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://api.realworld.io/api/articles/', {
    data:{
      "article":{"tagList":[],"title":"This is a test title","description":"This is a test description","body":"This is a test body"}
    },
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('This is a test title').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a test title')

})
