const DISPLAY_VISIBLE = "block";
const DISPLAY_HIDDEN = "none";

export function getElement(id: string): HTMLElement {
  const element = document.querySelector(`#${id}`);
  if (element === null) {
    throw new Error(`Failed to find the element with ID: ${id}`);
  }

  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`The "#${id}" element is not an HTMLElement.`);
  }

  return element;
}

export function setElement(id: string, content: string | number): void {
  const element = getElement(id);
  const contentString =
    typeof content === "string" ? content : content.toString();
  element.innerHTML = contentString;
}

export function hide(element: HTMLElement): void {
  element.style.display = DISPLAY_HIDDEN;
}

export function show(element: HTMLElement): void {
  element.style.display = DISPLAY_VISIBLE;
}

export function toggle(element: HTMLElement): void {
  if (element.style.display === DISPLAY_HIDDEN) {
    show(element);
  } else {
    hide(element);
  }
}
