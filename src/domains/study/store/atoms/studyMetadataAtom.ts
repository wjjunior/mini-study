import { atom } from "recoil";
import { StudyMetadata } from "../../model/types";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const studyMetadataAtom = atom<StudyMetadata | null>({
  key: RECOIL_KEYS.STUDY.METADATA,
  default: null,
});
