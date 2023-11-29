import { isObject } from "isaacscript-common-ts";
import { fillPage } from "./fillPage";
import { selectSaveFileError } from "./selectSaveFileSubroutines";
import { SAVE_FILE_SCHEMA } from "./types/SaveFile";

export async function readFile(file: File): Promise<void> {
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
