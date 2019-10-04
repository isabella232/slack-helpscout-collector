import { Mailbox } from './createService';

export const findMailbox = (mailboxes: Mailbox[], channelId: string): Mailbox | null => {
  const mailbox = mailboxes.find(({ channels }) => channels.some(id => id === channelId));

  if (!mailbox) {
    return null;
  }

  return mailbox;
};
