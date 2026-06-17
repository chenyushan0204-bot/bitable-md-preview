import { useEffect, useState } from 'react';
import { bitable, ThemeModeType } from '@lark-base-open/js-sdk';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeModeType>(ThemeModeType.LIGHT);

  useEffect(() => {
    let cancelled = false;

    const apply = async () => {
      const current = await bitable.bridge.getTheme();
      if (!cancelled) {
        setTheme(current);
        document.documentElement.dataset.theme = current === ThemeModeType.DARK ? 'dark' : 'light';
      }
    };

    apply();
    const off = bitable.bridge.onThemeChange((event) => {
      setTheme(event.data.theme);
      document.documentElement.dataset.theme =
        event.data.theme === ThemeModeType.DARK ? 'dark' : 'light';
    });

    return () => {
      cancelled = true;
      off();
    };
  }, []);

  return theme;
}
