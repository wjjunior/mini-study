import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { studyIdAtom } from "../atoms/studyIdAtom";
import { eventsAtom } from "../atoms/eventsAtom";
import { lastFetchedAtAtom, pollMsAtom } from "../../../../shared/store";
import { fetchEvents } from "../../../../api/mockApi";

export function useEventPolling() {
  const studyId = useRecoilValue(studyIdAtom);
  const pollMs = useRecoilValue(pollMsAtom);
  const setEvents = useSetRecoilState(eventsAtom);
  const setLastFetchedAt = useSetRecoilState(lastFetchedAtAtom);

  const studyIdRef = useRef(studyId);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    studyIdRef.current = studyId;
  }, [studyId]);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const poll = () => {
      const currentStudyId = studyIdRef.current;

      fetchEvents(currentStudyId, controller.signal)
        .then((newEvents) => {
          if (controller.signal.aborted) {
            return;
          }

          if (studyIdRef.current !== currentStudyId) {
            return;
          }

          setEvents(newEvents);
          setLastFetchedAt(Date.now());
        })
        .catch((err) => {
          if (err?.name === "AbortError") {
            return;
          }

          if (studyIdRef.current !== currentStudyId) {
            return;
          }

          console.error("Error polling events:", err);
        });
    };

    poll();

    const intervalId = setInterval(poll, pollMs);

    return () => {
      clearInterval(intervalId);
      controller.abort();
      controllerRef.current = null;
    };
  }, [pollMs, studyId, setEvents, setLastFetchedAt]);
}
