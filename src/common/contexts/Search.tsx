import React, { createContext, useState } from "react";

interface SearchProviderProps {
    children: React.ReactElement
}

export const SearchContext = createContext({});
SearchContext.displayName = "Search"

export function SearchProvider(props: SearchProviderProps) {
    const [search, setSearch] = useState("");

    return (
        <SearchContext.Provider value={{search, setSearch}}>
            {props.children}
        </SearchContext.Provider>
    )
}