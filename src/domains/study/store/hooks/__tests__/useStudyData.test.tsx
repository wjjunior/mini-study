import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { useStudyData } from "../useStudyData";
import { fetchStudy } from "../../../../../api/mockApi";
import { studyMetadataAtom } from "../../atoms/studyMetadataAtom";
import { signalsAtom } from "../../../../signal/store/atoms/signalsAtom";
import { eventsAtom } from "../../atoms/eventsAtom";
import {
  loadingStateAtom,
  errorStateAtom,
  timeWindowAtom,
  visibleSignalKeysAtom,
  lastFetchedAtAtom,
} from "../../../../../shared/store";
import type { AssessmentStudyResponse } from "../../../model/types";

jest.mock("../../../../../api/mockApi");

const mockFetchStudy = fetchStudy as jest.MockedFunction<typeof fetchStudy>;

const mockStudyData: AssessmentStudyResponse = {
  metadata: {
    study_id: "test-study-001",
    study_start: 0,
    study_end: 600,
  },
  signals: {
    hr: {
      timestamps: [0, 1, 2],
      values: [60, 61, 62],
    },
    spo2: {
      timestamps: [0, 1, 2],
      values: [95, 96, 97],
    },
  },
  events: [
    { id: "1", ts: 100, label: "Event 1" },
    { id: "2", ts: 200, label: "Event 2" },
  ],
};

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <RecoilRoot>{children}</RecoilRoot>
  );
}

function useAtomValue<T>(atom: any): T {
  const value = useRecoilValue(atom);
  return value as T;
}

describe("useStudyData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should fetch and update all atoms when studyId changes", async () => {
    mockFetchStudy.mockResolvedValue(mockStudyData);

    const { result } = renderHook(
      () => {
        useStudyData();
        return {
          metadata: useAtomValue(studyMetadataAtom),
          signals: useAtomValue(signalsAtom),
          events: useAtomValue(eventsAtom),
          loading: useAtomValue(loadingStateAtom),
          error: useAtomValue(errorStateAtom),
          timeWindow: useAtomValue(timeWindowAtom),
          visibleKeys: useAtomValue(visibleSignalKeysAtom),
          lastFetchedAt: useAtomValue(lastFetchedAtAtom),
        };
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(mockFetchStudy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockStudyData.metadata);
    expect(result.current.signals).toEqual(mockStudyData.signals);
    expect(result.current.events).toEqual(mockStudyData.events);
    expect(result.current.timeWindow).toEqual({
      startSec: 0,
      endSec: 600,
    });
    expect(result.current.visibleKeys).toEqual(new Set(["hr", "spo2"]));
    expect(result.current.error).toBe(null);
    expect(result.current.lastFetchedAt).toBeGreaterThan(0);
  });

  it("should handle errors and update error state", async () => {
    const error = new Error("Failed to fetch study");
    mockFetchStudy.mockRejectedValue(error);

    const { result } = renderHook(
      () => {
        useStudyData();
        return {
          loading: useAtomValue(loadingStateAtom),
          error: useAtomValue(errorStateAtom),
        };
      },
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual({
      message: "Failed to fetch study",
      context: "fetchStudy",
      timestamp: expect.any(Number),
    });
  });

  it("should abort request on unmount", async () => {
    let abortSignal: AbortSignal | undefined;
    mockFetchStudy.mockImplementation((_, signal) => {
      abortSignal = signal;
      return Promise.resolve(mockStudyData);
    });

    const { unmount } = renderHook(() => useStudyData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetchStudy).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(abortSignal?.aborted).toBe(true);
    });
  });
});
