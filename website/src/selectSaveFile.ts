import { readFile } from "./readFile.js";
import { getSelectSaveFileButton } from "./selectSaveFileSubroutines.js";

export function selectSaveFileButtonInit(): void {
  const chooseSaveFileButton = getSelectSaveFileButton();
  chooseSaveFileButton.addEventListener("change", chooseSaveFileButtonUsed);
}

function chooseSaveFileButtonUsed(event: Event) {
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
