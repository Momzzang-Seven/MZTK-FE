import { useCallback, useEffect, useRef, type MouseEvent } from "react";

export const useButtonClickGuard = (cooldownMs = 300) => {
  const releaseTimersRef = useRef(new Map<HTMLButtonElement, number>());

  useEffect(() => {
    const releaseTimers = releaseTimersRef.current;

    return () => {
      releaseTimers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      releaseTimers.clear();
    };
  }, []);

  return useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest("button");

      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      if (button.dataset.clickGuard === "off" || button.disabled) {
        return;
      }

      const activeTimer = releaseTimersRef.current.get(button);

      if (activeTimer) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const timerId = window.setTimeout(() => {
        releaseTimersRef.current.delete(button);
      }, cooldownMs);

      releaseTimersRef.current.set(button, timerId);
    },
    [cooldownMs]
  );
};
