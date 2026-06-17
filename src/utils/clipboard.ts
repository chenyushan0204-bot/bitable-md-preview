/**
 * 飞书多维表格在 window 上监听 copy 并校验「可复制」权限，会拦截插件内复制。
 * 在 window capture 阶段抢先写入剪贴板，避免触发飞书的权限拦截提示。
 */
let pendingCopyText: string | null = null;
let interceptorInstalled = false;

function ensureCopyInterceptor() {
  if (interceptorInstalled) return;
  interceptorInstalled = true;

  window.addEventListener(
    'copy',
    (event) => {
      if (pendingCopyText === null) return;
      const clipboardEvent = event as ClipboardEvent;
      clipboardEvent.preventDefault();
      clipboardEvent.stopPropagation();
      clipboardEvent.stopImmediatePropagation();
      clipboardEvent.clipboardData?.setData('text/plain', pendingCopyText);
    },
    true,
  );
}

function copyViaCaptureEvent(text: string): boolean {
  ensureCopyInterceptor();

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  pendingCopyText = text;
  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    pendingCopyText = null;
    textarea.remove();
  }

  return copied;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 优先走 capture 拦截，避免飞书 copy 权限钩子清空剪贴板
  if (copyViaCaptureEvent(text)) {
    return true;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
