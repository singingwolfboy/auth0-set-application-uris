import {ManagementClient} from 'auth0'

interface Urls {
  callback: string
  logout: string
}

export async function addUrls(
  client: ManagementClient,
  {callback: callbackUrl, logout: logoutUrl}: Urls
): Promise<void> {
  return
}

export async function removeUrls(
  client: ManagementClient,
  {callback: callbackUrl, logout: logoutUrl}: Urls
): Promise<void> {
  return
}
