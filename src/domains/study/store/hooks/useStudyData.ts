import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { studyIdAtom } from "../atoms/studyIdAtom";
import { studyMetadataAtom } from "../atoms/studyMetadataAtom";
import { eventsAtom } from "../atoms/eventsAtom";
import { signalsAtom } from "../../../signal/store/atoms/signalsAtom";
import {
  loadingStateAtom,
  errorStateAtom,
  timeWindowAtom,
  visibleSignalKeysAtom,
  lastFetchedAtAtom,
} from "../../../../shared/store";
import { fetchStudy } from "../../../../api/mockApi";
import { isValidSignalKey } from "../../../signal";
import type { SignalKey } from "../../../signal";

export function useStudyData() {
  const studyId = useRecoilValue(studyIdAtom);
  const setMetadata = useSetRecoilState(studyMetadataAtom);
  const setSignals = useSetRecoilState(signalsAtom);
  const setEvents = useSetRecoilState(eventsAtom);
  const setLoading = useSetRecoilState(loadingStateAtom);
  const setError = useSetRecoilState(errorStateAtom);
  const setTimeWindow = useSetRecoilState(timeWindowAtom);
  const setVisibleKeys = useSetRecoilState(visibleSignalKeysAtom);
  const setLastFetchedAt = useSetRecoilState(lastFetchedAtAtom);

  const studyIdRef = useRef(studyId);

  useEffect(() => {
    studyIdRef.current = studyId;
  }, [studyId]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchStudy(studyId, controller.signal)
      .then((data) => {
        if (cancelled) return;

        if (studyIdRef.current !== studyId) {
          return;
        }

        setMetadata(data.metadata);
        setSignals(data.signals);
        setEvents(data.events);
        setTimeWindow({
          startSec: data.metadata.study_start,
          endSec: data.metadata.study_end,
        });

        const availableKeys = new Set<SignalKey>(
          Object.keys(data.signals).filter(
            (key): key is SignalKey =>
              isValidSignalKey(key) && !!data.signals[key]
          )
        );
        setVisibleKeys(availableKeys);

        setLastFetchedAt(Date.now());
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;

        if (studyIdRef.current !== studyId) {
          return;
        }

        if (err?.name === "AbortError") {
          return;
        }

        setLoading(false);
        setError({
          message: err?.message || "Failed to load study",
          context: "fetchStudy",
          timestamp: Date.now(),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    studyId,
    setLoading,
    setError,
    setMetadata,
    setSignals,
    setEvents,
    setTimeWindow,
    setLastFetchedAt,
    setVisibleKeys,
  ]);
}
