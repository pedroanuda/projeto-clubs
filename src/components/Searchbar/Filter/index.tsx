import { Badge, FormControl, IconButton, InputLabel, Menu, MenuItem, Select } from "@mui/material";
import { FilterIcon } from "common/icons";
import { useState } from "react";
import styles from "./Filter.module.css"

export default function Filter() {
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorElement);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorElement(event.currentTarget);
    const handleClose = () => setAnchorElement(null);

    return (
    <>
    <IconButton onClick={handleClick}>
        <Badge>
            <FilterIcon />
        </Badge>
    </IconButton>
    <Menu open={open} anchorEl={anchorElement} onClose={handleClose}>
        <div className={styles.filterWindow}>
            <FormControl className={styles.filterSelect}>
                <InputLabel id="filter-selection-label">Filtrar por</InputLabel>
                <Select defaultValue="everything" id="filter-selection" labelId="filter-selection-label" label="Filtrar por">
                    <MenuItem value="everything">Tudo</MenuItem>
                    <MenuItem value="clubs">Clubinhos</MenuItem>
                    <MenuItem value="extras">Não Clubinhos (Extras)</MenuItem>
                    <MenuItem value="shelveds">Arquivados</MenuItem>
                </Select>
            </FormControl>
            <FormControl className={styles.filterSelect}>
                <InputLabel id="filter-selection-label1">Ordenar por</InputLabel>
                <Select defaultValue="fromAZName" id="filter-selection1" labelId="filter-selection-label1" label="Ordenar por">
                    <MenuItem value="fromAZName">Nome (A-Z)</MenuItem>
                    <MenuItem value="fromZAName">Nome (Z-A)</MenuItem>
                    <MenuItem value="fromAZOwner">Dono (A-Z)</MenuItem>
                    <MenuItem value="fromZAOwner">Dono (Z-A)</MenuItem>
                    <MenuItem value="">Data de Entrada (Antiga)</MenuItem>
                    <MenuItem value="">Data de Entrada (Nova)</MenuItem>
                </Select>
            </FormControl>
        </div>
    </Menu>
    </>
    )
}
