import * as core from '@actions/core'
import {addUrls, removeUrls} from './modify'
import {ManagementClient} from 'auth0'
import Mustache from 'mustache'
import {PullRequestEvent} from '@octokit/webhooks-types'
import {context} from '@actions/github'

async function run(): Promise<void> {
  if (context.eventName !== 'pull_request') {
    core.setFailed('This action only works with `pull_request` events')
    return
  }
  const payload = context.payload as PullRequestEvent
  try {
    const callbackUrlTemplate = core.getInput('callback-url-template', {
      required: true
    })
    const logoutUrlTemplate = core.getInput('logout-url-template', {
      required: true
    })
    const callbackUrl = Mustache.render(callbackUrlTemplate, {
      pull_request: payload.pull_request
    })
    const logoutUrl = Mustache.render(logoutUrlTemplate, {
      pull_request: payload.pull_request
    })
    const urls = {
      callback: callbackUrl,
      logout: logoutUrl
    }
    core.info(JSON.stringify(urls))

    const domain = core.getInput('auth0-domain', {required: true})
    const clientId = core.getInput('auth0-client-id', {required: true})
    const clientSecret = core.getInput('auth0-client-secret', {required: true})
    const auth0Client = new ManagementClient({
      domain,
      clientId,
      clientSecret,
      scope: 'read:clients update:clients'
    })
    const targetClientId = core.getInput('auth0-target-client-id') || clientId

    switch (payload.action) {
      case 'opened':
      case 'reopened':
        await addUrls(auth0Client, targetClientId, urls)
        return
      case 'closed':
        await removeUrls(auth0Client, targetClientId, urls)
        return
      default:
        core.setFailed(
          'This action only works with the `opened`, `reopened`, and `closed` actions for `pull_request` events'
        )
        return
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
