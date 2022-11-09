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
      logout: logoutUrl,
    }

    const domain = core.getInput('auth0-domain', {required: true})
    const clientId = core.getInput('auth0-client-id', {required: true})
    const clientSecret = core.getInput('auth0-client-secret', {required: true})
    const client = new ManagementClient({
      domain,
      clientId,
      clientSecret,
      scope: 'read:clients update:clients'
    })

    switch (payload.action) {
      case 'opened':
      case 'reopened':
        return addUrls(client, urls)
      case 'closed':
        return removeUrls(client, urls)
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
