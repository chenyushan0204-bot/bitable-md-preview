import { useCallback, useEffect, useState } from 'react';
import { bitable } from '@lark-base-open/js-sdk';

const HEADER_FIELD_KEY = 'mdPreviewHeaderFieldId';

export function usePluginConfig() {
  const [headerFieldId, setHeaderFieldIdState] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bitable.bridge
      .getData<string>(HEADER_FIELD_KEY)
      .then((value) => {
        if (value) setHeaderFieldIdState(value);
      })
      .finally(() => setReady(true));
  }, []);

  const setHeaderFieldId = useCallback(async (fieldId: string) => {
    setHeaderFieldIdState(fieldId);
    await bitable.bridge.setData(HEADER_FIELD_KEY, fieldId);
  }, []);

  return { headerFieldId, setHeaderFieldId, ready };
}
