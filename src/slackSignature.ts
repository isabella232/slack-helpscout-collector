import timingSafeCompare from 'tsscmp';
import { createHmac } from 'crypto';

type ValidateSignatureInput = {
  secret: string;
  payload: string;
  headers: {
    [key: string]: string | string[] | undefined;
  };
};

type ValidateSignatureOutput = [boolean, string | null];

export const validateSlackSignature = (input: ValidateSignatureInput): ValidateSignatureOutput => {
  const { secret, payload, headers } = input;

  const signatureHeader = headers['x-slack-signature'];
  const timestampHeader = headers['x-slack-request-timestamp'];

  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return [false, 'The headers does not contain a valid "x-slack-signature" attribute'];
  }

  if (!signatureHeader || typeof timestampHeader !== 'string') {
    return [false, 'The headers does not contain a valid "x-slack-request-timestamp" attribute'];
  }

  const ts = parseInt(timestampHeader, 10);

  // Divide current date to match Slack ts format
  // Subtract 5 minutes from current time
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

  if (ts < fiveMinutesAgo) {
    return [false, 'Slack request signing verification outdated'];
  }

  const hmac = createHmac('sha256', secret);
  const [version, hash] = signatureHeader.split('=');
  hmac.update(`${version}:${ts}:${payload}`);

  if (!timingSafeCompare(hash, hmac.digest('hex'))) {
    return [false, 'Slack request signing verification failed'];
  }

};
