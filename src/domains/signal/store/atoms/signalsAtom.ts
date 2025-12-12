import { atom } from "recoil";
import { Signals } from "../../model/types";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const signalsAtom = atom<Signals>({
  key: RECOIL_KEYS.SIGNAL.SIGNALS,
  default: {},
});
