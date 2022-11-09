import {addUrls, removeUrls} from '../src/modify'
import {ManagementClient} from 'auth0'
import {expect, test} from '@jest/globals'

test('empty addUrls', async () => {
  const auth0 = new ManagementClient({
    domain: 'fake-domain',
    clientId: 'fake-id',
    clientSecret: 'fake-secret'
  })
  const result = await addUrls(auth0, 'fake-id', {})
  await expect(result).rejects.toThrow('unknown')
})

test('empty removeUrls', async () => {
  const auth0 = new ManagementClient({
    domain: 'fake-domain',
    clientId: 'fake-id',
    clientSecret: 'fake-secret'
  })
  const result = await removeUrls(auth0, 'fake-id', {})
  await expect(result).rejects.toThrow('unknown')
})
