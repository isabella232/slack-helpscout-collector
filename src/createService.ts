import { RequestHandler, send, createError, text } from 'micro';
import { findMailbox } from './findMailbox';
import { HelpScoutClient } from './helpScoutClient';
import { WebClient } from '@slack/web-api';
import { formatText } from './helpScoutTemplate';
import { deriveInformation } from './slackAugmenter';
import { validateSlackSignature } from './slackSignature';

export type ServiceConfiguration = {
  helpScoutClient: HelpScoutClient;
  helpScoutMailboxes: {
    data: Mailbox[];
  };
  slackClient: WebClient;
  slackSigningSecret: string;
};

export type Mailbox = {
  mailboxId: number;
  assignTo?: number;
  channels: string[];
};

export const createService: (configuration: ServiceConfiguration) => RequestHandler = ({
  helpScoutClient,
  helpScoutMailboxes,
  slackClient,
  slackSigningSecret,
}) => {
  return async (req, res) => {
    if (!req.method || req.method !== 'POST') {
      res.setHeader('Allow', 'POST');

      throw createError(405, 'Only `POST` requests are allowed on this endpoint');
    }

    const body = await text(req);

    const [isValid] = validateSlackSignature({
      headers: req.headers,
      payload: body,
      secret: slackSigningSecret,
    });

    if (!isValid) {
      throw createError(401, 'Only Slack requests are allowed on this endpoint');
    }

    const info = await deriveInformation(body, slackClient);

    if (typeof info === 'string') {
      throw createError(405, info);
    }

    const { channel, channelName, content, link } = info;

    const mailbox = findMailbox(helpScoutMailboxes.data, channel);

    if (!mailbox) {
      return send(res, 202, `The hook does not support the channel: "${channelName}"`);
    }

    const { mailboxId, assignTo } = mailbox;

    const { data: responseAccessToken } = await helpScoutClient.getAccessToken();

    await helpScoutClient.createCustomerConversation({
      accessToken: responseAccessToken.access_token,
      conversation: {
        mailboxId,
        assignTo,
        subject: `[question imported from slack #${channelName}]`,
        customer: {
          email: 'support+slack@algolia.com',
        },
        text: formatText({ content, link }),
        tags: ['slack'],
      },
    });

    return send(res, 201, 'The Slack thread has been pushed to HelpScout');
  };
};
