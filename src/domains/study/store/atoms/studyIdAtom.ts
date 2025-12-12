import { atom } from "recoil";
import { StudyId, createStudyId } from "../../model/types";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const studyIdAtom = atom<StudyId>({
  key: RECOIL_KEYS.STUDY.ID,
  default: createStudyId("demo-study-001"),
});
