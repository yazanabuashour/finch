import { Window as HappyDOMWindow } from "happy-dom";

const happyWindow = new HappyDOMWindow();

type GlobalWithDom = typeof globalThis & {
  window: Window;
  document: Document;
  navigator: Navigator;
  HTMLElement: typeof happyWindow.HTMLElement;
  HTMLInputElement: typeof happyWindow.HTMLInputElement;
  Event: typeof happyWindow.Event;
  CustomEvent: typeof happyWindow.CustomEvent;
};

const globalWithDom = globalThis as GlobalWithDom;

globalWithDom.window = happyWindow as unknown as Window;
globalWithDom.document = happyWindow.document;
globalWithDom.navigator = happyWindow.navigator;
globalWithDom.HTMLElement = happyWindow.HTMLElement;
globalWithDom.HTMLInputElement = happyWindow.HTMLInputElement;
globalWithDom.Event = happyWindow.Event;
globalWithDom.CustomEvent = happyWindow.CustomEvent;
