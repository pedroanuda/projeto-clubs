import Grid from "@mui/material/Unstable_Grid2";
import IDog from "common/interfaces/IDog";
import DogCard from "components/DogCard";
import styles from "./DogsGrid.module.css";

interface DogsGridProps {
    dogsList?: IDog[] | null
}

export default function DogsGrid({ dogsList = [] }: DogsGridProps) {
  if (dogsList?.length) return (
    <Grid sx={{padding: "1rem"}} container spacing={{xs: 1.5}} columns={{ xs: 4, sm: 8, md: 12 }} disableEqualOverflow>
        {dogsList.map((dog, dogIndex) => (
            <Grid xs={2} sm={4} md={2} key={dog.id} minHeight={160}>
                <DogCard name={dog.name} ownerName={dog.ownerName} 
                isFromAClub={dog.isFromAClub} gender={dog.gender}
                id={dog.id} breed={dog.breed} shelved={dog.shelved} />
            </Grid>
        ))}
    </Grid>
  )
  else return (
    <div className={styles.unsuccessfulFindingOfDogs}>Não foi possível encontrar cachorro algum.</div>
  )
}
