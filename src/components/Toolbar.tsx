import { bitable, ToastType } from '@lark-base-open/js-sdk';
import { copyToClipboard } from '../utils/clipboard';
import { downloadMarkdown } from '../utils/download';
import { sanitizeFilename } from '../utils/fieldValue';

interface ToolbarProps {
  markdown: string;
  filenameBase: string;
  canNavigate: boolean;
  recordIndex: number;
  recordTotal: number;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
}

async function copyMarkdown(markdown: string, successMessage: string) {
  const ok = await copyToClipboard(markdown);
  if (ok) {
    await bitable.ui.showToast({ toastType: ToastType.success, message: successMessage });
    return;
  }
  await bitable.ui.showToast({
    toastType: ToastType.error,
    message: '复制失败，请检查多维表格是否允许复制，或使用「下载」',
  });
}

export default function Toolbar({
  markdown,
  filenameBase,
  canNavigate,
  recordIndex,
  recordTotal,
  onPrev,
  onNext,
  disabled,
}: ToolbarProps) {
  const copyContent = async () => {
    if (!markdown) return;
    await copyMarkdown(markdown, '已复制到剪贴板');
  };

  const download = () => {
    if (!markdown) return;
    downloadMarkdown(markdown, sanitizeFilename(filenameBase));
    void bitable.ui.showToast({ toastType: ToastType.success, message: '已开始下载' });
  };

  const convertHint = async () => {
    if (!markdown) return;
    await copyMarkdown(markdown, '已复制 Markdown，请新建飞书文档后粘贴');
  };

  const positionLabel =
    canNavigate && recordIndex >= 0 && recordTotal > 0
      ? `${recordIndex + 1} / ${recordTotal}`
      : '';

  return (
    <div className="toolbar">
      <div className="toolbar-nav">
        <button type="button" className="btn" onClick={onPrev} disabled={disabled || !canNavigate}>
          上一行
        </button>
        <button type="button" className="btn" onClick={onNext} disabled={disabled || !canNavigate}>
          下一行
        </button>
        {positionLabel ? <span className="toolbar-position">{positionLabel}</span> : null}
      </div>
      <div className="toolbar-actions">
        <button type="button" className="btn btn-primary" onClick={copyContent} disabled={disabled}>
          复制
        </button>
        <button type="button" className="btn" onClick={download} disabled={disabled}>
          下载
        </button>
        <button type="button" className="btn" onClick={convertHint} disabled={disabled}>
          转文档
        </button>
      </div>
    </div>
  );
}
