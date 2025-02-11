import { useTheme } from "@mui/material/styles";
import styles from "./Searchbar.module.css";
import { Button, Divider, MenuItem, Select } from "@mui/material";
import { SearchIcon } from "common/icons";
import Filter from "./Filter";
import React from "react";

interface SearchBarProps {
    placeholder?: string,
    value?: string | null,
    onChange?: React.ChangeEventHandler<HTMLInputElement>,
    onSubmit?: React.FormEventHandler<HTMLFormElement>,
    style?: React.CSSProperties
}

export default function SearchBar({ placeholder, value, onChange, onSubmit, style }: SearchBarProps) {
    const theme = useTheme();

    return (
      <form action={""} className={styles.searchBar} style={{"--accent-color": theme.palette.primary.main, ...style} as React.CSSProperties}
      onSubmit={onSubmit}>
            <div className={styles.searchThings}>
                <input placeholder={placeholder} type="search" className={styles.searchInput} 
                value={value ?? ""} onChange={onChange}/>
                <Button className={styles.searchButton} 
                variant="contained" sx={{borderRadius: "20px", position: "absolute"}}
                type="submit" disableElevation
                startIcon={<SearchIcon />}>Buscar</Button>
            </div>
            <div className={styles.filterDiv}>
                <Divider orientation="vertical" flexItem/>
                <div>
                    <label>Opções de Filtro:</label>
                    <Filter />
                </div>
            </div>
      </form>
    )
}
