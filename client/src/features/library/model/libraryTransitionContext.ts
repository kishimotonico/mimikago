import { createContext } from "react";

export type StartLibraryTransition = (action: () => void) => void;

export const LibraryTransitionContext = createContext<StartLibraryTransition | null>(null);
