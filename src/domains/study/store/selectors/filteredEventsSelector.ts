import { selector } from "recoil";
import { Event } from "../../model/types";
import { eventsAtom } from "../atoms/eventsAtom";
import { timeWindowAtom } from "../../../../shared/store/atoms/uiAtoms";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const filteredEventsSelector = selector<Event[]>({
  key: RECOIL_KEYS.SELECTORS.FILTERED_EVENTS,
  get: ({ get }) => {
    const events = get(eventsAtom);
    const timeWindow = get(timeWindowAtom);

    return events.filter(
      (event) =>
        event.ts >= timeWindow.startSec && event.ts <= timeWindow.endSec
    );
  },
});
