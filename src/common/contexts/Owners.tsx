import { createContext } from "react";

interface OwnersContextProps {
    
}

const OwnerContext = createContext<OwnersContextProps>({});
OwnerContext.displayName = "Owners"

export {}