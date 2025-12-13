import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { useResponsiveDimensions } from "../useResponsiveDimensions";
import {
  chartDimensionsAtom,
  ChartDimensions,
} from "../../../store/atoms/uiAtoms";

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );
}

function useAtomValue<T>(atom: any): T {
  const value = useRecoilValue(atom);
  return value as T;
}

describe("useResponsiveDimensions", () => {
  const originalInnerWidth = window.innerWidth;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  let resizeListeners: Array<() => void> = [];

  beforeEach(() => {
    resizeListeners = [];
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });

    window.addEventListener = jest.fn((event: string, listener: any) => {
      if (event === "resize") {
        resizeListeners.push(listener);
      }
      originalAddEventListener.call(window, event, listener);
    });

    window.removeEventListener = jest.fn((event: string, listener: any) => {
      if (event === "resize") {
        const index = resizeListeners.indexOf(listener);
        if (index > -1) {
          resizeListeners.splice(index, 1);
        }
      }
      originalRemoveEventListener.call(window, event, listener);
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it("should set default dimensions for desktop viewport", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        width: 1000,
        height: 300,
      });
    });
  });

  it("should set mobile dimensions for mobile viewport", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        width: 468,
        height: 300,
      });
    });
  });

  it("should return container width for desktop", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { result } = renderHook<number, unknown>(
      () => useResponsiveDimensions(),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current).toBe(1000);
    });
  });

  it("should return container width for mobile", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook<number, unknown>(
      () => useResponsiveDimensions(),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current).toBe(468);
    });
  });

  it("should update dimensions when window is resized to mobile", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.width).toBe(1000);
    });

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      resizeListeners.forEach((listener) => listener());
    });

    await waitFor(() => {
      expect(result.current.width).toBe(468);
    });
  });

  it("should update dimensions when window is resized to desktop", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.width).toBe(468);
    });

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1000,
      });
      resizeListeners.forEach((listener) => listener());
    });

    await waitFor(() => {
      expect(result.current.width).toBe(1000);
    });
  });

  it("should handle viewport exactly at breakpoint", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.width).toBe(1000);
    });
  });

  it("should handle viewport just below breakpoint", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook<ChartDimensions, unknown>(
      () => {
        useResponsiveDimensions();
        return useAtomValue(chartDimensionsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.width).toBe(735);
    });
  });

  it("should add resize event listener on mount", () => {
    renderHook(() => useResponsiveDimensions(), {
      wrapper: createWrapper(),
    });

    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should remove resize event listener on unmount", () => {
    const { unmount } = renderHook(() => useResponsiveDimensions(), {
      wrapper: createWrapper(),
    });

    const initialListenerCount = resizeListeners.length;
    expect(initialListenerCount).toBeGreaterThan(0);

    act(() => {
      unmount();
    });

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
    expect(resizeListeners.length).toBeLessThan(initialListenerCount);
  });
});
