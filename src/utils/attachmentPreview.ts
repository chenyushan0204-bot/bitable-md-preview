import type { IAttachmentField, IOpenAttachment } from '@lark-base-open/js-sdk';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|heic|avif)$/i;

export function isImageAttachment(att: IOpenAttachment): boolean {
  if (att.type?.startsWith('image/')) return true;
  return IMAGE_EXT.test(att.name);
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

export async function loadAttachmentMarkdown(
  attachmentField: IAttachmentField,
  recordId: string,
): Promise<string> {
  const attachments = await attachmentField.getValue(recordId);
  if (!attachments.length) return '';

  const urls = await attachmentField.getAttachmentUrls(recordId);
  return attachmentsToMarkdown(attachments, urls);
}
