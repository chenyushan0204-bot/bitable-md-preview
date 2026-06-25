import './App.css';
import ConfigBar from './components/ConfigBar';
import MarkdownPreview from './components/MarkdownPreview';
import Toolbar from './components/Toolbar';
import { useFieldMetaList, useMarkdownPreview } from './hooks/useMarkdownPreview';
import { usePluginConfig } from './hooks/usePluginConfig';
import { useTheme } from './hooks/useTheme';
import { sanitizeFilename } from './utils/fieldValue';

export default function App() {
  useTheme();
  const { headerFieldId, setHeaderFieldId, ready } = usePluginConfig();
  const fields = useFieldMetaList();
  const { state, navigate, reloadCurrent } = useMarkdownPreview(headerFieldId, ready);

  const filenameBase =
    state.headerText.trim() ||
    state.fieldName ||
    (state.recordIndex >= 0 ? `record-${state.recordIndex + 1}` : 'preview');

  const showPreview = state.status === 'ready' || state.status === 'empty';
  const showHeader = Boolean(headerFieldId) && showPreview;

  const handleHeaderFieldChange = async (fieldId: string) => {
    await setHeaderFieldId(fieldId);
    await reloadCurrent();
  };

  return (
    <main className="main">
      <header className="app-header">
        <h1 className="app-title">Markdown 预览</h1>
        <p className="app-hint">点击多行文本、附件或引用附件的查找引用单元格即可预览</p>
      </header>

      <ConfigBar
        fields={fields}
        headerFieldId={headerFieldId}
        onHeaderFieldChange={handleHeaderFieldChange}
      />

      <Toolbar
        markdown={state.markdown}
        filenameBase={sanitizeFilename(filenameBase)}
        canNavigate={state.canNavigate}
        recordIndex={state.recordIndex}
        recordTotal={state.recordTotal}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        disabled={!showPreview || state.status === 'empty'}
      />

      <section className="preview-panel">
        {state.status === 'idle' && (
          <div className="placeholder">请在左侧表格中选择一个可预览的单元格</div>
        )}
        {state.status === 'loading' && <div className="placeholder">加载中…</div>}
        {state.status === 'wrong-field' && (
          <div className="placeholder placeholder-warn">{state.errorMessage}</div>
        )}
        {state.status === 'error' && (
          <div className="placeholder placeholder-error">{state.errorMessage}</div>
        )}
        {state.status === 'empty' && (
          <>
            {showHeader ? (
              <div className="field-preview">
                <div className="field-preview-label">{state.headerFieldName || '字段预览'}</div>
                <div className="field-preview-value">{state.headerText || '（空）'}</div>
              </div>
            ) : null}
            <div className="placeholder">当前单元格为空</div>
          </>
        )}
        {state.status === 'ready' && (
          <>
            {showHeader ? (
              <div className="field-preview">
                <div className="field-preview-label">{state.headerFieldName || '字段预览'}</div>
                <div className="field-preview-value">{state.headerText || '（空）'}</div>
              </div>
            ) : null}
            <MarkdownPreview content={state.markdown} />
          </>
        )}
      </section>
    </main>
  );
}
