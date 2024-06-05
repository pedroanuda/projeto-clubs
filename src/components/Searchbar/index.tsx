import { useTheme } from "@mui/material/styles";
import styles from "./Searchbar.module.css";
import { Button, Divider, MenuItem, Select } from "@mui/material";
import { SearchIcon } from "common/icons";
import Filter from "./Filter";

interface SearchBarProps {
    placeholder?: string
}

export default function SearchBar({ placeholder }: SearchBarProps) {
    const theme = useTheme();

    return (
      <form action={""} className={styles.searchBar} style={{"--accent-color": theme.palette.primary.main} as React.CSSProperties}>
            <div className={styles.searchThings}>
                <input placeholder={placeholder} type="search" className={styles.searchInput} />
                <Button className={styles.searchButton} 
                variant="contained" sx={{borderRadius: "20px", position: "absolute"}}
                type="submit" disableElevation
                startIcon={<SearchIcon />}>Buscar</Button>

                <div className={styles.searchSelectParent}>
                    <label>Pesquisar por:</label>
                    <Select defaultValue={"name"} className={styles.searchSelect} sx={{borderRadius: "20px"}}>
                        <MenuItem value="name">Nome</MenuItem>
                        <MenuItem value="owner">Dono</MenuItem>
                    </Select>
                </div>
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
