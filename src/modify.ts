import * as core from '@actions/core'
import {Client, ManagementClient} from 'auth0'

interface Urls {
  callback?: string
  logout?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function addUrls(
  auth0: ManagementClient,
  targetClientId: string,
  {callback: callbackUrl, logout: logoutUrl}: Urls
): Promise<Client | void> {
  const params = {client_id: targetClientId}
  let client
  try {
    client = await auth0.getClient(params)
  } catch (err) {
    const message = getErrorMessage(err)
    core.error(`Unable to get Auth0 application: ${message}`)
    throw err
  }
  const updates: Partial<Client> = {}
  if (callbackUrl) {
    const callbacks = client.callbacks || []
    const index = callbacks.indexOf(callbackUrl)
    if (index === -1) {
      callbacks.push(callbackUrl)
      updates.callbacks = callbacks
    }
  }
  if (logoutUrl) {
    const logouts = client.allowed_logout_urls || []
    const index = logouts.indexOf(logoutUrl)
    if (index === -1) {
      logouts.push(logoutUrl)
      updates.allowed_logout_urls = logouts
    }
  }
  if (Object.keys(updates).length > 0) {
    core.debug(`updates: ${JSON.stringify(updates)}`)
    return auth0.updateClient(params, updates)
  } else {
    return client
  }
}

export async function removeUrls(
  auth0: ManagementClient,
  targetClientId: string,
  {callback: callbackUrl, logout: logoutUrl}: Urls
): Promise<Client> {
  const params = {client_id: targetClientId}
  let client
  try {
    client = await auth0.getClient(params)
  } catch (err) {
    const message = getErrorMessage(err)
    core.error(`Unable to get Auth0 application: ${message}`)
    throw err
  }
  const updates: Partial<Client> = {}
  if (callbackUrl) {
    const callbacks = client.callbacks || []
    const index = callbacks.indexOf(callbackUrl)
    if (index > -1) {
      callbacks.splice(index, 1)
      updates.callbacks = callbacks
    }
  }
  if (logoutUrl) {
    const logouts = client.allowed_logout_urls || []
    const index = logouts.indexOf(logoutUrl)
    if (index > -1) {
      logouts.splice(index, 1)
      updates.allowed_logout_urls = logouts
    }
  }
  if (Object.keys(updates).length > 0) {
    core.debug(`updates: ${JSON.stringify(updates)}`)
    return auth0.updateClient(params, updates)
  } else {
    return client
  }
}
