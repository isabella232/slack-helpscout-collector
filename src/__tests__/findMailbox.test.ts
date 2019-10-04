import { Mailbox } from '../createService';
import { findMailbox } from '../findMailbox';

describe('findMailbox', () => {
  it('expect to return a mailbox with a `channelId` that match', () => {
    const channelId = 'CSSDSD';
    const mailboxes = [{ mailboxId: 15, channels: ['CSSDSD', 'XCXC'] }];

    const actual = findMailbox(mailboxes, channelId);

    expect(actual).toEqual({
      mailboxId: 15,
      channels: ['CSSDSD', 'XCXC'],
    });
  });

  it("expect to return `null` with a `channelId` that doesn't match", () => {
    const channelId = 'FAKE';
    const mailboxes = [{ mailboxId: 15, channels: ['CSSDSD', 'XCXC'] }];

    const actual = findMailbox(mailboxes, channelId);

    expect(actual).toBe(null);
  });

  it('expect to return `null` with data empty', () => {
    const channelId = 'NOTHING';
    const mailboxes: Mailbox[] = [];

    const actual = findMailbox(mailboxes, channelId);

    expect(actual).toBe(null);
  });
});
