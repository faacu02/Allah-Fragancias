import { useEffect, useRef } from 'react';

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previousElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (active) {
      previousElementRef.current = document.activeElement;
    }

    if (!active) {
      const prev = previousElementRef.current as HTMLElement | null;
      if (prev && prev !== document.body) prev.focus();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const focusable = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = el.querySelectorAll<HTMLElement>(focusable)[0];
    firstFocusable?.focus();

    function handler(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const all = [...(el as HTMLDivElement).querySelectorAll<HTMLElement>(focusable)];
      if (!all.length) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      const prev = previousElementRef.current as HTMLElement | null;
      if (prev && prev !== document.body) prev.focus();
    };
  }, [active]);

  return ref;
}
