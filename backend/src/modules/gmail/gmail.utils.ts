import { gmail_v1 } from 'googleapis';

function decodeBase64Url(data: string) {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function findPart(
  parts: gmail_v1.Schema$MessagePart[] = [],
  mimeType: string,
): gmail_v1.Schema$MessagePart | undefined {
  for (const part of parts) {
    if (part.mimeType === mimeType) {
      return part;
    }

    const nested = findPart(part.parts, mimeType);

    if (nested) {
      return nested;
    }
  }

  return undefined;
}

export function extractMessageBody(payload?: gmail_v1.Schema$MessagePart) {
  if (!payload) {
    return '';
  }

  // plain text body
  if (payload.mimeType === 'text/plain') {
    return payload.body?.data ? decodeBase64Url(payload.body.data) : '';
  }

  // multipart
  const plainTextPart = findPart(payload.parts, 'text/plain');

  if (plainTextPart?.body?.data) {
    return decodeBase64Url(plainTextPart.body.data);
  }

  // fallback html
  const htmlPart = findPart(payload.parts, 'text/html');

  if (htmlPart?.body?.data) {
    return decodeBase64Url(htmlPart.body.data);
  }

  return '';
}
