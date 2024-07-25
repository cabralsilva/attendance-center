export interface FiltersContextState {
  tags: Map<string, JSX.Element>;
  setTags: React.Dispatch<React.SetStateAction<Map<string, JSX.Element>>>;
  updateTags: (key: string, element: JSX.Element) => void;
}

export type FiltersProviderProps = {
  children: React.ReactNode;
};
