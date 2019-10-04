import * as modules from '../slackSignature';

describe('slackSignature', () => {
  describe('validateSlackSignature', () => {
    it('returns `false` for headers without `X-Hub-Signature`', () => {
      const input = {
        secret: 'mySuperSecretToken',
        payload: '',
        headers: {},
      };

      const [value, message] = modules.validateSlackSignature(input);

      expect(value).toBe(false);
      expect(message).toMatchInlineSnapshot(
        `"The headers does not contain a valid \\"X-Hub-Signature\\" attribute"`
      );
    });

    it('returns `false` for an algorithm that does not matches `sha1`', () => {
      const input = {
        secret: 'mySuperSecretToken',
        payload: '',
        headers: {
          'x-hub-signature': 'md5=xxx',
        },
      };

      const [value, message] = modules.validateSlackSignature(input);

      expect(value).toBe(false);
      expect(message).toMatchInlineSnapshot(
        `"The algorithm \\"md5\\" does not match the one expected"`
      );
    });

    it('returns `false` for a payload digest length that does not matches the signature digest length', () => {
      const input = {
        secret: 'mySuperSecretToken',
        payload: 'FakeContent',
        headers: {
          'x-hub-signature': 'sha1=FakeSignature',
        },
      };

      const [value, message] = modules.validateSlackSignature(input);

      expect(value).toBe(false);
      expect(message).toMatchInlineSnapshot(
        `"The payload digest length does not match the signature digest length"`
      );
    });

    it('returns `false` for a payload digest that does not matches the signature digest', () => {
      const input = {
        secret: 'mySuperSecretTokenThatDontMatch',
        payload: slackSignedPayload,
        headers: {
          'x-hub-signature': 'sha1=ff04ac57f20b9d1c41856366fe779fb1ff50ce12',
        },
      };

      const [value, message] = modules.validateSlackSignature(input);

      expect(value).toBe(false);
      expect(message).toMatchInlineSnapshot(
        `"The payload digest does not match the signature digest"`
      );
    });

    it('returns `true` for a payload digest that matches the signature digest', () => {
      const input = {
        secret: 'mySuperSecretToken',
        payload: slackSignedPayload,
        headers: {
          'x-hub-signature': 'sha1=ff04ac57f20b9d1c41856366fe779fb1ff50ce12',
        },
      };

      const [value, message] = modules.validateSlackSignature(input);

      expect(value).toBe(true);
      expect(message).toBe(null);
    });
  });
});

const slackSignedPayload = '';
