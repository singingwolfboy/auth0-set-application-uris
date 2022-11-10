import {addUrls, removeUrls} from '../src/modify'
import nock from 'nock'
import {ManagementClient} from 'auth0'
import {describe, expect, test} from '@jest/globals'

describe('addUrls', () => {
  test('add valid data', async () => {
    const auth0 = new ManagementClient({
      domain: 'fake-domain',
      clientId: 'fake-id',
      clientSecret: 'fake-secret'
    })
    const urls = {
      callback: 'https://example.com/callback',
      logout: 'https://example.com/logout'
    }

    let patchBody

    const scope = nock('https://fake-domain')
      .post('/oauth/token')
      .reply(200, {access_token: 'fake-token'})
      .get('/api/v2/clients/fake-target-id')
      .reply(200, {
        client_id: 'fake-target-id',
        name: 'Test App',
        description: '',
        callbacks: ['http://localhost/callback'],
        allowed_logout_urls: ['http://localhost/logout']
      })
      .patch('/api/v2/clients/fake-target-id', body => {
        patchBody = body
        return body
      })
      .reply(200, {})

    await addUrls(auth0, 'fake-target-id', urls)

    expect(scope.isDone()).toBeTruthy()
    expect(patchBody).toMatchObject({
      callbacks: ['http://localhost/callback', 'https://example.com/callback'],
      allowed_logout_urls: [
        'http://localhost/logout',
        'https://example.com/logout'
      ]
    })
  })

  test('valid data, already present', async () => {
    const auth0 = new ManagementClient({
      domain: 'fake-domain',
      clientId: 'fake-id',
      clientSecret: 'fake-secret'
    })
    const urls = {
      callback: 'https://example.com/callback',
      logout: 'https://example.com/logout'
    }

    const scope = nock('https://fake-domain')
      .post('/oauth/token')
      .reply(200, {access_token: 'fake-token'})
      .get('/api/v2/clients/fake-target-id')
      .reply(200, {
        client_id: 'fake-target-id',
        name: 'Test App',
        description: '',
        callbacks: [
          'http://localhost/callback',
          'https://example.com/callback'
        ],
        allowed_logout_urls: [
          'http://localhost/logout',
          'https://example.com/logout'
        ]
      })
    // no PATCH request, since no change is required

    await addUrls(auth0, 'fake-target-id', urls)

    expect(scope.isDone()).toBeTruthy()
  })
})

describe('removeUrls', () => {
  test('remove valid data', async () => {
    const auth0 = new ManagementClient({
      domain: 'fake-domain',
      clientId: 'fake-id',
      clientSecret: 'fake-secret'
    })
    const urls = {
      callback: 'https://example.com/callback',
      logout: 'https://example.com/logout'
    }

    let patchBody

    const scope = nock('https://fake-domain')
      .post('/oauth/token')
      .reply(200, {access_token: 'fake-token'})
      .get('/api/v2/clients/fake-target-id')
      .reply(200, {
        client_id: 'fake-target-id',
        name: 'Test App',
        description: '',
        callbacks: [
          'http://localhost/callback',
          'https://example.com/callback'
        ],
        allowed_logout_urls: [
          'http://localhost/logout',
          'https://example.com/logout'
        ]
      })
      .patch('/api/v2/clients/fake-target-id', body => {
        patchBody = body
        return body
      })
      .reply(200, {})

    await removeUrls(auth0, 'fake-target-id', urls)

    expect(scope.isDone()).toBeTruthy()
    expect(patchBody).toMatchObject({
      callbacks: ['http://localhost/callback'],
      allowed_logout_urls: ['http://localhost/logout']
    })
  })

  test('valid data, not present', async () => {
    const auth0 = new ManagementClient({
      domain: 'fake-domain',
      clientId: 'fake-id',
      clientSecret: 'fake-secret'
    })
    const urls = {
      callback: 'https://example.com/callback',
      logout: 'https://example.com/logout'
    }

    const scope = nock('https://fake-domain')
      .post('/oauth/token')
      .reply(200, {access_token: 'fake-token'})
      .get('/api/v2/clients/fake-target-id')
      .reply(200, {
        client_id: 'fake-target-id',
        name: 'Test App',
        description: '',
        callbacks: ['http://localhost/callback'],
        allowed_logout_urls: ['http://localhost/logout']
      })
    // no PATCH request, since no change is required

    await removeUrls(auth0, 'fake-target-id', urls)

    expect(scope.isDone()).toBeTruthy()
  })
})
