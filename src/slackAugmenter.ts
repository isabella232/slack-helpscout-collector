import { WebClient } from '@slack/web-api';

type SlackMessage = {
  channel: { name: string; id: string };
  message_ts: string;
  callback_id: string;
  message: {
    client_msg_id: string;
    type: string;
    text: string;
    user: string;
    ts: string;
    team: string;
    thread_ts: string;
    reply_count: number;
    reply_users_count: number;
    latest_reply: string;
    reply_users: string[];
    replies: Array<{ user: string; ts: string }>;
    subscribed: boolean;
  };
};

const parseSlackJsonp = (body: string) =>
  JSON.parse(decodeURIComponent(body).substr('payload='.length)) as SlackMessage;

export async function deriveInformation(body: string, slackClient: WebClient) {
  const slackMessage = parseSlackJsonp(body);

  if (slackMessage.callback_id !== 'helpscout') {
    return 'wrong callback';
  }

  let content: string;
  if (slackMessage.message.thread_ts) {
    const replies = await slackClient.channels.replies({
      channel: slackMessage.channel.id,
      thread_ts: slackMessage.message.thread_ts,
    });

    const messages = replies.messages as Array<{ text: string; user: string }>;

    const userIds = messages.reduce(
      (acc, message) => {
        if (acc[message.user] === undefined) {
          acc[message.user] = undefined;
        }
        return acc;
      },
      {} as { [userId: string]: any }
    );

    const userResponse = await Promise.all(
      Object.keys(userIds).map(user =>
        slackClient.users.info({ user }).catch(() => ({
          ok: false,
          user: {
            id: user,
            real_name: user,
          },
        }))
      )
    );

    userResponse.forEach(response => {
      const {
        user: { id, real_name },
      } = response as { ok: boolean; user: { real_name: string; id: string } };

      userIds[id] = real_name;
    });

    content = messages.map(({ user, text }) => `${userIds[user]}: ${text}`).join('\n\n');
  } else {
    const message = slackMessage.message.text.replace(/[+]/g, ' ');

    const user = slackMessage.message.user;

    const info = await slackClient.users.info({ user }).catch(() => ({
      ok: false,
      user: {
        id: user,
        real_name: user,
      },
    }));

    const userInfo = info.user as { id: string; real_name: string };

    content = `${userInfo.real_name}: ${message}`;
  }

  const { permalink } = await slackClient.chat.getPermalink({
    message_ts: slackMessage.message_ts,
    channel: slackMessage.channel.id,
  });

  return {
    link: permalink as string,
    content,
    channel: slackMessage.channel.id,
    channelName: slackMessage.channel.name,
  };
}
