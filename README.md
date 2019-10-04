# Slack HelpScout Collector

This is a server to collect `helpscout` events from Slack through [message actions](https://api.slack.com/actions) and sent them to [HelpScout](https://helpscout.com) with the [Mailbox API 2.0](https://developer.helpscout.com/mailbox-api/). To link repositories to mailboxes we use the environment variable `HELP_SCOUT_MAILBOXES`. The structure of the JSON looks like this:

```json
{
  "data": [
    {
      "label": "<teamName>",
      "mailboxId": "<mailboxId>",
      "assignTo": "<assignTo>",
      "channels": [
        "<repoId>",
        "<repoId>",
      ]
    },
    {
      "label": "<teamName>",
      "mailboxId": "<mailboxId>",
      "channels": [
        "<repoId>",
        "<repoId>",
      ]
    }
  ]
}
```

You need to create a Slack app, and set this endpoint as "Request URL" for the "interactivity" of the app.

### Run the production server

```
HELP_SCOUT_APP_ID=yourHelpScoutAppId \
HELP_SCOUT_APP_SECRET=yourHelpScoutAppSecret \
HELP_SCOUT_APP_MAILBOXES={...} \
SLACK_APP_TOKEN=yourSlackAppSecret \
SLACK_SIGNING_SECRET=yourSlackSigningSecret \
yarn start
```

### Run the development server

```
HELP_SCOUT_APP_ID=yourHelpScoutAppId \
HELP_SCOUT_APP_SECRET=yourHelpScoutAppSecret \
HELP_SCOUT_APP_MAILBOXES={...} \
SLACK_APP_TOKEN=yourSlackAppSecret \
SLACK_SIGNING_SECRET=yourSlackSigningSecret \
yarn dev
```

### Run the build

```
yarn build
```

### Run the test

```
yarn test
```
