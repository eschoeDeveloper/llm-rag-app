import React from "react";

export function useLocalStorage(key: string, initial: string) {
  const [value, setValue] = React.useState(() => {
    const v = localStorage.getItem(key);
    return v ?? initial;
  });

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}