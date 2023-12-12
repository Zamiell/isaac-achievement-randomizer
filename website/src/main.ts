// Since the polyfill needs to be imported for side-effects, we import it first.
// eslint-disable-next-line import/no-unassigned-import
import "isaac-lua-polyfill";

import { isObject } from "isaacscript-common-ts";
import { fillPage } from "./fillPage";
import { SAVE_FILE_SCHEMA } from "./types/SaveFile";
import { getElement, show } from "./utils";

const CHOOSE_SAVE_FILE_BUTTON_ID = "choose-save-file";
const CHOOSE_SAVE_FILE_ERROR_ID = "choose-save-file-error";
const CHOOSE_SAVE_FILE_ERROR_TEXT_ID = "choose-save-file-error-text";

window.addEventListener("load", () => {
  selectSaveFileButtonInit();
});

export function selectSaveFileButtonInit(): void {
  const chooseSaveFileButton = getElement(CHOOSE_SAVE_FILE_BUTTON_ID);
  chooseSaveFileButton.addEventListener("change", chooseSaveFileButtonChanged);
}

function chooseSaveFileButtonChanged(event: Event) {
  if (event.target === null) {
    return;
  }

  const inputElement = event.target as HTMLInputElement;
  const { files } = inputElement;
  if (files === null) {
    return;
  }

  const file = files[0];
  if (file === undefined) {
    return;
  }

  // We do not have to await this, so the promise is not floating.
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  readFile(file);
}

async function readFile(file: File): Promise<void> {
  const text = await file.text();

  try {
    const object = JSON.parse(text) as unknown;
    if (!isObject(object)) {
      throw new Error("The selected file is not a valid JSON file.");
    }

    const saveFile = SAVE_FILE_SCHEMA.parse(object);
    fillPage(saveFile);
  } catch (error) {
    selectSaveFileError(error);
  }
}

function selectSaveFileError(error: unknown) {
  const errorElement = getElement(CHOOSE_SAVE_FILE_ERROR_ID);
  show(errorElement);
  const errorTextElement = getElement(CHOOSE_SAVE_FILE_ERROR_TEXT_ID);
  errorTextElement.innerHTML = `${error}`;
}
