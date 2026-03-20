import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

interface DebounceControls<T> {
  clear: () => void;
  flush: () => undefined | T;
  isPending: boolean;
  cancel: () => void;
}

interface ValueDebounceReturn<T> extends DebounceControls<T> {
  value: T;
  immediateValue: T;
}

interface CallbackDebounceReturn<T extends (...args: any[]) => any>
  extends DebounceControls<T> {
  callback: T;
  pending: boolean;
}

/**
 * Universal debounce hook with full controls for both values and callbacks
 *
 * For values:
 *   const { value, immediateValue, clear, flush, isPending } = useDebounce(value, { delay: 500 });
 *
 * For callbacks:
 *   const { callback, clear, flush, isPending } = useDebounce(fn, { delay: 500 });
 */
export function useDebounce<T>(
  input: T,
  options: UseDebounceOptions = {},
): T extends (...args: any[]) => any
  ? CallbackDebounceReturn<T>
  : ValueDebounceReturn<T> {
  const { delay = 500, leading = false, trailing = true } = options;
  const isFunction = typeof input === "function";

  // State for value debouncing
  const [debouncedValue, setDebouncedValue] = useState<T>(input);
  // State only for callback debouncing (value debouncing derives isPending)
  const [callbackIsPending, setCallbackIsPending] = useState(false);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef(input);
  const leadingCalledRef = useRef(false);
  const pendingArgsRef = useRef<any[] | null>(null);

  // Always update the ref (must be in useEffect for React 19 compatibility)
  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  // Clear timeout
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setCallbackIsPending(false);
      leadingCalledRef.current = false;
      pendingArgsRef.current = null;
    }
  }, []);

  // Cancel - alias for clear
  const cancel = clear;

  // Flush - immediately execute pending operation
  const flush = useCallback(() => {
    if (!timeoutRef.current) {
      return;
    } // Nothing to flush

    if (isFunction) {
      // For callbacks, execute with stored args if available
      if (pendingArgsRef.current !== null) {
        const fn = inputRef.current as (...args: any[]) => any;
        const args = pendingArgsRef.current;
        clear();
        fn(...args);
      } else {
        clear();
      }
    } else {
      // For values, immediately set the debounced value
      const currentValue = inputRef.current;
      clear();
      setDebouncedValue(currentValue);
    }
  }, [clear, isFunction]);

  // VALUE DEBOUNCING EFFECT
  useEffect(() => {
    if (isFunction) {
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    leadingCalledRef.current = false;
    pendingArgsRef.current = null;

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(inputRef.current);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay, isFunction]);

  // Derive isPending for value debouncing (avoids setState in effect)
  const valueIsPending = !isFunction && input !== debouncedValue;

  // CALLBACK DEBOUNCING
  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (!isFunction) {
        return;
      }

      const execute = () => {
        const fn = inputRef.current as (...args: any[]) => any;
        fn(...args);
      };

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setCallbackIsPending(false);
      }

      // Store args for potential flush
      pendingArgsRef.current = args;

      // Leading edge
      if (leading && !leadingCalledRef.current) {
        execute();
        leadingCalledRef.current = true;

        if (!trailing) {
          // Only leading, no trailing - still set timeout to reset state
          timeoutRef.current = setTimeout(() => {
            leadingCalledRef.current = false;
            timeoutRef.current = null;
            pendingArgsRef.current = null;
          }, delay);
          return;
        }
      }

      // Trailing edge
      if (trailing) {
        setCallbackIsPending(true);
        timeoutRef.current = setTimeout(() => {
          if (!leading || leadingCalledRef.current) {
            // Execute if no leading, or if leading already executed
            execute();
          }
          timeoutRef.current = null;
          setCallbackIsPending(false);
          leadingCalledRef.current = false;
          pendingArgsRef.current = null;
        }, delay);
      }
    },
    [delay, leading, trailing, isFunction],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return appropriate interface based on input type
  if (isFunction) {
    return {
      callback: debouncedCallback as T,
      clear,
      flush,
      cancel,
      isPending: callbackIsPending,
      pending: callbackIsPending,
    } as any;
  }

  return {
    value: debouncedValue,
    immediateValue: input,
    clear,
    flush,
    cancel,
    isPending: valueIsPending,
  } as any;
}
