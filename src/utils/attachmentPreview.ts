import { checkers, type IOpenAttachment, type ITable } from '@lark-base-open/js-sdk';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|heic|avif)$/i;

export function isImageAttachment(att: IOpenAttachment): boolean {
  if (att.type?.startsWith('image/')) return true;
  return IMAGE_EXT.test(att.name);
}

export function extractAttachments(value: unknown): IOpenAttachment[] {
  if (checkers.isAttachments(value)) return value;
  if (checkers.isAttachment(value)) return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractAttachments(item));
  }
  return [];
}

export function attachmentsToMarkdown(attachments: IOpenAttachment[], urls: string[]): string {
  return attachments
    .map((att, index) => {
      const url = urls[index];
      if (!url) return '';
      if (isImageAttachment(att)) {
        return `![${att.name}](${url})`;
      }
      return `[${att.name}](${url})`;
    })
    .filter(Boolean)
    .join('\n\n');
}

export async function loadAttachmentMarkdownFromCell(
  table: ITable,
  fieldId: string,
  recordId: string,
): Promise<string> {
  const value = await table.getCellValue(fieldId, recordId);
  const attachments = extractAttachments(value);
  if (!attachments.length) return '';

  const tokens = attachments.map((att) => att.token).filter(Boolean);
  if (!tokens.length) return '';

  const urls = await table.getCellAttachmentUrls(tokens, fieldId, recordId);
  return attachmentsToMarkdown(attachments, urls);
}
