import type { ObjectiveID } from "./ObjectiveID";
import type { UnlockID } from "./UnlockID";

export interface Achievement {
  objectiveID: ObjectiveID;
  unlockID: UnlockID | undefined;
}
