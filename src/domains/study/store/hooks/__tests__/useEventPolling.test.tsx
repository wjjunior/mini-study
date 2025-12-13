import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { useEventPolling } from "../useEventPolling";
import { fetchEvents } from "../../../../../api/mockApi";
import { studyIdAtom } from "../../atoms/studyIdAtom";
import { eventsAtom } from "../../atoms/eventsAtom";
import { pollMsAtom, lastFetchedAtAtom } from "../../../../../shared/store";
import type { Event } from "../../../model/types";

jest.mock("../../../../../api/mockApi");

const mockFetchEvents = fetchEvents as jest.MockedFunction<typeof fetchEvents>;

const mockEvents: Event[] = [
  { id: "1", ts: 100, label: "Event 1" },
  { id: "2", ts: 200, label: "Event 2" },
];

function createWrapper(initialStudyId = "test-study-001", pollMs = 1000) {
  return ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot
      initializeState={({ set }) => {
        set(studyIdAtom, initialStudyId);
        set(pollMsAtom, pollMs);
      }}
    >
      {children}
    </RecoilRoot>
  );
}

function useAtomValue<T>(atom: any): T {
  const value = useRecoilValue(atom);
  return value as T;
}

describe("useEventPolling", () => {
  const originalError = console.error;
  let consoleErrorSpy: jest.SpyInstance | null = null;

  beforeAll(() => {
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("An update to") ||
          args[0].includes("was not wrapped in act") ||
          args[0].includes("TestComponent") ||
          args[0].includes("Error polling events:"))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should fetch events immediately on mount", async () => {
    mockFetchEvents.mockResolvedValue(mockEvents);

    renderHook(() => useEventPolling(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith(
        "test-study-001",
        expect.any(AbortSignal)
      );
    });
  });

  it("should update events on successful fetch", async () => {
    mockFetchEvents.mockResolvedValue(mockEvents);

    const { result } = renderHook(
      () => {
        useEventPolling();
        return useAtomValue(eventsAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current).toEqual(mockEvents);
    });
  });

  it("should update lastFetchedAt on successful fetch", async () => {
    mockFetchEvents.mockResolvedValue(mockEvents);

    const { result } = renderHook(
      () => {
        useEventPolling();
        return useAtomValue(lastFetchedAtAtom);
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current).toBeGreaterThan(0);
    });
  });

  it("should ignore AbortError silently", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    mockFetchEvents.mockRejectedValue(abortError);

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    renderHook(() => useEventPolling(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    consoleErrorSpy = null;
  });

  it("should handle non-abort errors and log them", async () => {
    const error = new Error("Network error");
    mockFetchEvents.mockRejectedValue(error);

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    renderHook(() => useEventPolling(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error polling events:",
        error
      );
    });

    consoleErrorSpy.mockRestore();
    consoleErrorSpy = null;
  });

  it("should cancel polling and abort requests on unmount", async () => {
    let abortSignal: AbortSignal | undefined;
    mockFetchEvents.mockImplementation((_, signal) => {
      abortSignal = signal;
      return Promise.resolve(mockEvents);
    });

    const { unmount } = renderHook(() => useEventPolling(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });

    const initialCallCount = mockFetchEvents.mock.calls.length;

    act(() => {
      unmount();
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(abortSignal?.aborted).toBe(true);
    });

    expect(mockFetchEvents.mock.calls.length).toBe(initialCallCount);
  });
});
