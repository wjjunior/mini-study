import { atom } from "recoil";
import { Event } from "../../model/types";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const eventsAtom = atom<Event[]>({
  key: RECOIL_KEYS.STUDY.EVENTS,
  default: [],
});
