# Set Application URIs for Auth0

This [GitHub Action](https://github.com/features/actions) allows you to
add or remove application URIs from an [Auth0](https://auth0.com)
application. It's perfect for integrating pull request deployments
with Auth0, so that you can seamlessly review pull requests without
manually changing settings in Auth0.

## Setup & Install

First, go to the Auth0 Dashboard and
[create a new application](https://auth0.com/docs/get-started/auth0-overview/create-applications).
The name does not matter, but since GitHub Actions will be using this
application to make changes in Auth0, we suggest using the name
"GitHub Actions". For the application type, choose
"Machine to Machine Applications".

When Auth0 asks you to select an API for your new application,
choose the "Auth0 Management API". When it asks you to select permissions
for this API, check the boxes for "read:clients" and "update:clients".

Once you have created your new application, go to the "Settings"
tab and find the "Basic Information" section for this new application.
Notice that Auth0 has assigned a domain, client ID, and client secret
to your application. On GitHub, you should
[create encrypted secrets for GitHub Actions](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
for each of these values. We suggest naming these secrets
`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET`,
respectively.

Back on the Auth0 Dashboard, find the application that you want this
GitHub Action to modify. This is a _different_ application from the
one you just created! Find the client ID for this application; you
will need this in a moment. (You do _not_ need the client secret,
and the domain should be the same.)

Create a file named `auth0.yml` in the `.github/workflows` directory
of your repository. Put in the following contents:

```yaml
name: Auth0
on:
  pull_request:
    types: [opened, reopened, closed]

jobs:
  auth0-set-application-uris:
    name: Set Application URIs
    runs-on: ubuntu-latest
    steps:
      - uses: singingwolfboy/auth0-set-application-uris@v1
        with:
          auth0-domain: ${{ secrets.AUTH0_DOMAIN }}
          auth0-client-id: ${{ secrets.AUTH0_CLIENT_ID }}
          auth0-client-secret: ${{ secrets.AUTH0_CLIENT_SECRET }}
          auth0-target-client-id: "eX4AmP1e-Id123"
          callback-url-template: "https://pr-{{ pull_request.number }}.example.com/callback"
          logout-url-template: "https://pr-{{ pull_request.number }}.example.com/"
```

You will need to customize the last three lines for your own usage.
The `auth0-target-client-id` variable should contain the client ID
of the Auth0 application that you want to modify. The
`callback-url-template` and `logout-url-template` variables should
contain [Mustache templates](https://github.com/janl/mustache.js)
for the callback URL and logout URL for your pull request deployment.
These templates will be evaluated with a `pull_request` variable,
which comes directly from
[GitHub's API for getting a pull request](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request).

Commit this file to your repository, and push it to GitHub. From
now on, this GitHub Action should take care of adding and removing
these callback and logout URLs on your target Auth0 application,
automatically when pull requests are opened and closed.
