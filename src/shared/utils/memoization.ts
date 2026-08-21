import React, { useMemo, useCallback, useRef, useEffect } from "react";

/**
 * Deep comparison of two values
 * Useful for memoization dependencies
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Custom hook for debounced values
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttled callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();

      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - (now - lastRunRef.current));
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Custom hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Create a stable memoized object
 */
export function useMemoizedObject<T extends Record<string, any>>(
  obj: T,
  deps: React.DependencyList
): T {
  const memoRef = useRef<T>(obj);

  return useMemo(() => {
    if (!deepEqual(memoRef.current, obj)) {
      memoRef.current = obj;
    }
    return memoRef.current;
  }, deps);
}
