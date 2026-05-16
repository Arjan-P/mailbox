/**
 * Builds and base64url-encodes an RFC 2822 email message ready for
 * gmail.users.messages.send / .import.
 *
 * Rules that matter for Gmail:
 * - Lines MUST be terminated with \r\n (CRLF), not \n.
 * - The header block and body are separated by a blank CRLF line.
 * - The whole thing is base64url encoded (not standard base64).
 * - Subjects containing non-ASCII characters must be RFC 2047 encoded;
 *   strip/replace non-ASCII for now.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc2822
 */

const CRLF = '\r\n';

export interface BuildEmailOptions {
  from: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  inReplyTo?: string;
  references?: string;
}

function encodeHeaderValue(value: string): string {
  // printable ascii only
  if (/^[ -~]*$/.test(value)) return value;

  const b64 = Buffer.from(value, 'utf-8').toString('base64');
  return `=?UTF-8?B?${b64}?=`;
}

export function buildRfc2822Message(opts: BuildEmailOptions): string {
  const headers: string[] = [
    `From: ${opts.from}`,
    `To: ${opts.to.join(', ')}`,
    `Subject: ${encodeHeaderValue(opts.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
  ];

  if (opts.cc && opts.cc.length > 0) {
    headers.push(`Cc: ${opts.cc.join(', ')}`);
  }

  if (opts.inReplyTo) {
    headers.push(`In-Reply-To: ${opts.inReplyTo}`);
  }

  if (opts.references) {
    headers.push(`References: ${opts.references}`);
  }

  const raw = [...headers, '', opts.body].join(CRLF);
  return Buffer.from(raw).toString('base64url');
}

export function extractMessageId(
  headers: Array<{ name?: string | null; value?: string | null }>,
): string | undefined {
  return (
    headers.find((h) => h.name?.toLowerCase() === 'message-id')?.value ??
    undefined
  );
}

export function buildReferencesHeader(
  headers: Array<{ name?: string | null; value?: string | null }>,
  inReplyTo: string,
): string {
  const existing =
    headers.find((h) => h.name?.toLowerCase() === 'references')?.value ?? '';

  return existing ? `${existing} ${inReplyTo}` : inReplyTo;
}
