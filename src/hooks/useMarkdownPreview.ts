import { useCallback, useEffect, useRef, useState } from 'react';
import {
  bitable,
  FieldType,
  IAttachmentField,
  IFieldMeta,
  IGridView,
  ToastType,
  ViewType,
} from '@lark-base-open/js-sdk';
import { loadAttachmentMarkdown } from '../utils/attachmentPreview';
import { getFieldDisplayText } from '../utils/fieldValue';

export type PreviewStatus = 'idle' | 'loading' | 'ready' | 'wrong-field' | 'empty' | 'error';

export interface PreviewState {
  status: PreviewStatus;
  markdown: string;
  headerText: string;
  headerFieldName: string;
  fieldName: string;
  recordIndex: number;
  recordTotal: number;
  canNavigate: boolean;
  errorMessage: string;
}

const initialState: PreviewState = {
  status: 'idle',
  markdown: '',
  headerText: '',
  headerFieldName: '',
  fieldName: '',
  recordIndex: -1,
  recordTotal: 0,
  canNavigate: false,
  errorMessage: '',
};

async function loadAllVisibleRecordIds(view: IGridView): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: number | undefined;
  let hasMore = true;

  while (hasMore) {
    const page = await view.getVisibleRecordIdListByPage({
      pageSize: 200,
      pageToken,
    });
    ids.push(...page.recordIds.filter(Boolean) as string[]);
    hasMore = page.hasMore;
    pageToken = page.pageToken;
    if (!hasMore) break;
  }

  return ids;
}

export function useMarkdownPreview(headerFieldId: string, configReady: boolean) {
  const [state, setState] = useState<PreviewState>(initialState);
  const headerFieldIdRef = useRef(headerFieldId);
  const contextRef = useRef({
    tableId: '',
    viewId: '',
    fieldId: '',
    recordId: '',
    recordIds: [] as string[],
    canNavigate: false,
  });

  headerFieldIdRef.current = headerFieldId;

  const loadRecordContent = useCallback(
    async (tableId: string, viewId: string, fieldId: string, recordId: string) => {
      setState((prev) => ({ ...prev, status: 'loading', errorMessage: '' }));

      try {
        const table = await bitable.base.getTableById(tableId);
        const fieldMeta = await table.getFieldMetaById(fieldId);

        let markdown = '';

        if (fieldMeta.type === FieldType.Text) {
          markdown = await table.getCellString(fieldId, recordId);
        } else if (fieldMeta.type === FieldType.Attachment) {
          const attachmentField = await table.getField<IAttachmentField>(fieldId);
          markdown = await loadAttachmentMarkdown(attachmentField, recordId);
        } else {
          setState({
            ...initialState,
            status: 'wrong-field',
            fieldName: fieldMeta.name,
            errorMessage: `「${fieldMeta.name}」不支持预览，请点击多行文本或附件字段。`,
          });
          return;
        }
        const activeHeaderFieldId = headerFieldIdRef.current;
        let headerText = '';
        let headerFieldName = '';

        if (activeHeaderFieldId) {
          try {
            const headerMeta = await table.getFieldMetaById(activeHeaderFieldId);
            headerFieldName = headerMeta.name;
            headerText = await getFieldDisplayText(table, activeHeaderFieldId, recordId);
          } catch {
            headerText = '';
            headerFieldName = '';
          }
        }

        const recordIds = contextRef.current.recordIds;
        const recordIndex = recordIds.indexOf(recordId);

        setState({
          status: markdown.trim() ? 'ready' : 'empty',
          markdown,
          headerText,
          headerFieldName,
          fieldName: fieldMeta.name,
          recordIndex,
          recordTotal: recordIds.length,
          canNavigate: contextRef.current.canNavigate && recordIds.length > 0,
          errorMessage: markdown.trim() ? '' : '当前单元格为空',
        });

        contextRef.current = {
          ...contextRef.current,
          tableId,
          viewId,
          fieldId,
          recordId,
        };
      } catch (error) {
        setState({
          ...initialState,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : '读取单元格失败',
        });
      }
    },
    [],
  );

  const reloadCurrent = useCallback(async () => {
    const ctx = contextRef.current;
    if (!ctx.tableId || !ctx.viewId || !ctx.fieldId || !ctx.recordId) return;
    await loadRecordContent(ctx.tableId, ctx.viewId, ctx.fieldId, ctx.recordId);
  }, [loadRecordContent]);

  const refreshNavigation = useCallback(async (tableId: string, viewId: string) => {
    try {
      const table = await bitable.base.getTableById(tableId);
      const view = await table.getViewById(viewId);
      const viewType = await view.getType();

      if (viewType !== ViewType.Grid) {
        contextRef.current.recordIds = [];
        contextRef.current.canNavigate = false;
        return;
      }

      const recordIds = await loadAllVisibleRecordIds(view as IGridView);
      contextRef.current.recordIds = recordIds;
      contextRef.current.canNavigate = true;
    } catch {
      contextRef.current.recordIds = [];
      contextRef.current.canNavigate = false;
    }
  }, []);

  const handleSelection = useCallback(
    async (tableId: string | null, viewId: string | null, fieldId: string | null, recordId: string | null) => {
      if (!tableId || !viewId || !fieldId || !recordId) {
        setState({ ...initialState, status: 'idle' });
        return;
      }

      await refreshNavigation(tableId, viewId);
      await loadRecordContent(tableId, viewId, fieldId, recordId);
    },
    [loadRecordContent, refreshNavigation],
  );

  const navigate = useCallback(
    async (direction: -1 | 1) => {
      const { tableId, viewId, fieldId, recordId, recordIds, canNavigate } = contextRef.current;
      if (!canNavigate || !tableId || !viewId || !fieldId || !recordId) return;

      const currentIndex = recordIds.indexOf(recordId);
      if (currentIndex < 0) return;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= recordIds.length) {
        await bitable.ui.showToast({
          toastType: ToastType.info,
          message: direction < 0 ? '已是第一行' : '已是最后一行',
        });
        return;
      }

      await loadRecordContent(tableId, viewId, fieldId, recordIds[nextIndex]);
    },
    [loadRecordContent],
  );

  useEffect(() => {
    if (!configReady) return;

    let offSelection: (() => void) | undefined;
    let offRecordModify: (() => void) | undefined;

    const bootstrap = async () => {
      const selection = await bitable.base.getSelection();
      await handleSelection(selection.tableId, selection.viewId, selection.fieldId, selection.recordId);

      offSelection = bitable.base.onSelectionChange((event) => {
        const { tableId, viewId, fieldId, recordId } = event.data;
        handleSelection(tableId, viewId, fieldId, recordId);
      });

      try {
        const table = await bitable.base.getActiveTable();
        offRecordModify = table.onRecordModify((event) => {
          const { recordId, fieldIds } = event.data;
          const ctx = contextRef.current;
          if (recordId !== ctx.recordId) return;
          const headerId = headerFieldIdRef.current;
          if (!fieldIds.includes(ctx.fieldId) && (!headerId || !fieldIds.includes(headerId))) return;
          loadRecordContent(ctx.tableId, ctx.viewId, ctx.fieldId, ctx.recordId);
        });
      } catch {
        // table may not be ready
      }
    };

    bootstrap();

    return () => {
      offSelection?.();
      offRecordModify?.();
    };
  }, [configReady, handleSelection, loadRecordContent]);

  useEffect(() => {
    if (!configReady) return;
    reloadCurrent();
  }, [configReady, headerFieldId, reloadCurrent]);

  return {
    state,
    navigate,
    reloadCurrent,
  };
}

export function useFieldMetaList() {
  const [fields, setFields] = useState<IFieldMeta[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const table = await bitable.base.getActiveTable();
        setFields(await table.getFieldMetaList());
      } catch {
        setFields([]);
      }
    };

    load();
    const off = bitable.base.onSelectionChange(async () => {
      await load();
    });
    return off;
  }, []);

  return fields;
}
