import { Divider } from "@mui/material";
import { useDogsContext } from "common/contexts/Dogs";
import DogsGrid from "components/DogsGrid";
import SearchBar from "components/Searchbar";

export default function WatchingDogs() {
  const { dogs } = useDogsContext();

  return (
    <>
    <SearchBar placeholder="Procure por aqui..."/>
    <Divider />
    <DogsGrid dogsList={dogs} />
    </>
  )
}
