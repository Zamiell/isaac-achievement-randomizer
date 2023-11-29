import { objectKeysToSet } from "isaacscript-common-ts";
import { ALL_OBJECTIVES } from "../../src/arrays/allObjectives";
import { hideSelectSaveFileArea } from "./selectSaveFileSubroutines";
import type { SaveFile } from "./types/SaveFile";
import { getElement, setElement, show, toggle } from "./utils";

const SAVE_FILE_STATS_ID = "save-file-stats";
const HIDE_TEXT = "Hide";
const SHOW_TEXT = "Show";

export function fillPage(saveFile: SaveFile): void {
  const completedObjectiveIDs = objectKeysToSet(
    saveFile.AchievementTracker.persistent.completedObjectiveIDs,
  );
  completedObjectiveIDs.delete("__TSTL_SET");

  // Stats
  setElement("seed", saveFile.AchievementTracker.persistent.seed);
  setElement(
    "randomizerMode",
    saveFile.AchievementTracker.persistent.randomizerMode,
  );
  setElement(
    "header-objectives",
    `(${completedObjectiveIDs.size} / ${ALL_OBJECTIVES.length})`,
  );
  setElement(
    "header-total-time",
    `(${completedObjectiveIDs.size} / ${ALL_OBJECTIVES.length})`,
  );

  initToggleForSection("stats");

  hideSelectSaveFileArea();
  const saveFileStats = getElement(SAVE_FILE_STATS_ID);
  show(saveFileStats);
}

function initToggleForSection(prefix: string) {
  const toggleElement = getElement(`${prefix}-toggle`);
  const sectionElement = getElement(`${prefix}-section`);

  toggleElement.addEventListener("click", () => {
    toggle(sectionElement);
    swapLinkText(toggleElement);
  });
}

function swapLinkText(element: HTMLElement) {
  const newLinkText = element.innerHTML === HIDE_TEXT ? SHOW_TEXT : HIDE_TEXT;
  element.innerHTML = newLinkText;
}
