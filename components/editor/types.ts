export type DeviceType = "Desktop" | "Tablet" | "Mobile";

export type EditorElement = {
  id: string;
  type: EditorElementType;
  name: string;
  styles: Record<string, string>;
  content: EditorElement[] | { innerText?: string; href?: string; src?: string };
};

export type EditorElementType =
  | "__body"
  | "container"
  | "2Col"
  | "3Col"
  | "text"
  | "link"
  | "image"
  | "video"
  | "contactForm"
  | "paymentForm"
  | null;

export type Editor = {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  device: DeviceType;
  previewMode: boolean;
  funnelPageId: string;
};

export type HistoryState = {
  history: Editor[];
  currentIndex: number;
};

export type EditorState = {
  editor: Editor;
  history: HistoryState;
};

export const defaultStyles: Record<string, string> = {
  backgroundPosition: "center",
  objectFit: "cover",
  backgroundRepeat: "no-repeat",
  textAlign: "left",
  opacity: "100%",
};

export const initialEditorState: EditorState = {
  editor: {
    elements: [
      {
        id: "__body",
        type: "__body",
        name: "Body",
        styles: {},
        content: [],
      },
    ],
    selectedElement: null,
    device: "Desktop",
    previewMode: false,
    funnelPageId: "",
  },
  history: {
    history: [],
    currentIndex: 0,
  },
};

// Action types
export type EditorAction =
  | { type: "ADD_ELEMENT"; payload: { containerId: string; elementDetails: EditorElement } }
  | { type: "UPDATE_ELEMENT"; payload: { elementDetails: EditorElement } }
  | { type: "DELETE_ELEMENT"; payload: { elementId: string } }
  | { type: "SELECT_ELEMENT"; payload: { element: EditorElement | null } }
  | { type: "CHANGE_DEVICE"; payload: { device: DeviceType } }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_DATA"; payload: { elements: EditorElement[]; funnelPageId: string } }
  | { type: "MOVE_ELEMENT"; payload: { elementId: string; newContainerId: string; index: number } };
