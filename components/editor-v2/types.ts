export type EditorElement = {
  id: string;
  type: string;
  name: string;
  styles: React.CSSProperties;
  content: EditorElement[] | Record<string, string>;
};

export type DeviceType = 'Desktop' | 'Tablet' | 'Mobile';

export type EditorAction =
  | { type: 'ADD_ELEMENT'; payload: { containerId: string; elementDetails: EditorElement } }
  | { type: 'UPDATE_ELEMENT'; payload: { elementDetails: EditorElement } }
  | { type: 'DELETE_ELEMENT'; payload: { elementDetails: EditorElement } }
  | { type: 'CHANGE_CLICKED_ELEMENT'; payload: { elementDetails?: EditorElement } }
  | { type: 'CHANGE_DEVICE'; payload: { device: DeviceType } }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'TOGGLE_LIVE_MODE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_DATA'; payload: { elements: EditorElement[]; withLive: boolean } }
  | { type: 'SET_FUNNELPAGE_ID'; payload: { funnelPageId: string } };

export type EditorState = {
  elements: EditorElement[];
  selectedElement: EditorElement | null;
  device: DeviceType;
  previewMode: boolean;
  liveMode: boolean;
  funnelPageId: string;
};

export type HistoryState = {
  history: EditorState[];
  currentIndex: number;
};

export type Editor = {
  editor: EditorState;
  history: HistoryState;
};
