import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Attachment } from 'resend';

export const EMAIL_LOGO_FULL_CID = 'copa-manager-logo-full';

function resolveEmailAssetsDir(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));

  const candidates = [
    path.join(moduleDir, 'assets'),
    path.join(moduleDir, 'emails', 'assets'),
  ];

  for (const dir of candidates) {
    if (existsSync(path.join(dir, 'logo_full.png'))) {
      return dir;
    }
  }

  throw new Error(
    'Email logo assets not found. Expected logo_full.png in backend/src/emails/assets.'
  );
}

function readAsset(filename: string): Buffer {
  return readFileSync(path.join(resolveEmailAssetsDir(), filename));
}

export function getEmailInlineAttachments(): Attachment[] {
  return [
    {
      content: readAsset('logo_full.png'),
      filename: 'logo_full.png',
      contentType: 'image/png',
      contentId: EMAIL_LOGO_FULL_CID,
    },
  ];
}
