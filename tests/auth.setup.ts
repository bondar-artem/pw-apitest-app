import { test as setup } from '@playwright/test';
import user from '../.auth/user.json'
import fs from 'fs'

const authFile = '.auth/user.json'

setup('authentication', async({request}) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"pwtest@test.com","password":"Welcome1"}
    }
  })
  const responseBody = await response.json()
  const accessToken = responseBody.user.token
  user.origins[0].localStorage[0].value = accessToken
  fs.writeFileSync(authFile, JSON.stringify(user))

  process.env['ACCESS_TOKEN'] = accessToken


})