import { useTheme, Menu, MenuItem } from "@mui/material";
import styles from "./DogCard.module.css";
import { CSSProperties, memo, useState } from "react";
import { BreedIcon, FemaleIcon, MaleIcon } from "common/icons";
import { useNavigate } from "react-router-dom";
import { useDogsContext } from "common/contexts/Dogs";

interface DogCardProps {
  id: string,
  name: string,
  ownerName: string,
  gender?: 'male' | 'female' | string,
  breed?: string,
  isFromAClub?: boolean,
  shelved?: boolean
}

function DogCard({ id, name, ownerName, gender, breed, isFromAClub, shelved = false }: DogCardProps) {
  const theme = useTheme();
  const [contextMenu, setContextMenu] = useState<{mouseX: number; mouseY: number;} | null>(null);
  const { removeDog } = useDogsContext();
  const navigate = useNavigate();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    setContextMenu(contextMenu === null ? {
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6
    } : null);
  }

  return (
    <>
    <div className={styles.card}
    onClick={() => navigate(`dogdetails/${id}`)}
    style={{"--accent-color": theme.palette.primary.main} as CSSProperties}
    onContextMenu={handleContextMenu}>
      <div>
        <h4>{name}</h4>
        <h6>De {ownerName}</h6>
      </div>
      <div className={styles.cardDetails}>
        <div>
          {gender === 'female'
          ? <FemaleIcon />
          : <MaleIcon />}
          <span>
            {gender === 'female'
            ? "Fêmea"
            : "Macho"}
          </span>
        </div>
        <div>
          <BreedIcon />
          <span>{breed}</span>
        </div>
      </div>
      {shelved
      ? <div className={styles.cardChip} style={{"--accent-color": "grey"} as CSSProperties}>Arquivado</div>
      : (isFromAClub
        && <div className={styles.cardChip}>Club</div>
        )
      }
    </div>
    <Menu open={contextMenu !== null} onClose={() => setContextMenu(null)}
    anchorReference="anchorPosition" anchorPosition={contextMenu !== null
    ? {top: contextMenu.mouseY, left: contextMenu.mouseX} : undefined}>
      <MenuItem onClick={() => {setContextMenu(null); removeDog(id)}}>Remover</MenuItem>
    </Menu>
    </>
  )
}

export default memo(DogCard);
