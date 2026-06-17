import type { IOpenCellValue, IOpenSegment, IOpenSingleSelect, IOpenUser, ITable } from '@lark-base-open/js-sdk';

export function segmentsToPlainText(segments: IOpenSegment[] | null | undefined): string {
  if (!segments?.length) return '';
  return segments
    .map((seg) => {
      if ('text' in seg && typeof seg.text === 'string') return seg.text;
      return '';
    })
    .join('');
}

export function formatOpenCellValue(value: IOpenCellValue | string | null | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    const first = value[0];
    if (typeof first === 'string') return value.join(', ');
    if (first && typeof first === 'object' && 'text' in first) {
      return segmentsToPlainText(value as IOpenSegment[]);
    }
    if (first && typeof first === 'object' && 'name' in first && 'id' in first) {
      return (value as IOpenUser[]).map((u) => u.name || u.enName || '').filter(Boolean).join(', ');
    }
    if (first && typeof first === 'object' && 'text' in first && 'id' in first) {
      return value.map((item) => (item as IOpenSingleSelect).text || '').filter(Boolean).join(', ');
    }
    return value.map((item) => formatOpenCellValue(item as IOpenCellValue)).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    if ('text' in value && typeof (value as IOpenSingleSelect).text === 'string') {
      return (value as IOpenSingleSelect).text || '';
    }
    if ('name' in value && 'id' in value) {
      const user = value as IOpenUser;
      return user.name || user.enName || '';
    }
    if ('link' in value && 'text' in value) {
      return String((value as { text?: string }).text || '');
    }
  }
  return '';
}

export async function getFieldDisplayText(
  table: ITable,
  fieldId: string,
  recordId: string,
): Promise<string> {
  try {
    const field = await table.getField(fieldId);
    const text = await field.getCellString(recordId);
    if (text?.trim()) return text;
  } catch {
    // fall through
  }

  try {
    const value = await table.getCellValue(fieldId, recordId);
    return formatOpenCellValue(value);
  } catch {
    return '';
  }
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'preview';
}
