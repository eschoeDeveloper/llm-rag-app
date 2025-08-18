import React from "react";

export function useScrollToBottom(deps: readonly unknown[]) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, deps);
  return ref;
}