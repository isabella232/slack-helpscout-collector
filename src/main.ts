import { createHelpScoutClient } from './helpScoutClient';
import { createService } from './createService';
import { WebClient } from '@slack/web-api';

// const githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET || 'mySuperSecretToken';

const helpScoutAppId = process.env.HELP_SCOUT_APP_ID || '';
const helpScoutAppSecret = process.env.HELP_SCOUT_APP_SECRET || '';

const helpScoutMailboxes = (process.env.HELP_SCOUT_MAILBOXES &&
  JSON.parse(process.env.HELP_SCOUT_MAILBOXES)) || {
  data: [],
};

const helpScoutClient = createHelpScoutClient({
  appId: helpScoutAppId,
  appSecret: helpScoutAppSecret,
});

const slackClient = new WebClient(process.env.SLACK_APP_TOKEN);

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || '';

export default createService({
  slackClient,
  helpScoutClient,
  helpScoutMailboxes,
  slackSigningSecret,
});
