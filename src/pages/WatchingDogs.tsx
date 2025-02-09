import { Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import DogsGrid from "components/DogsGrid";
import SearchBar from "components/Searchbar";
import { getAllDogs } from "common/services/dogService";

export default function WatchingDogs() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['dogos'],
    queryFn: () => getAllDogs(false)
  });

  if (isPending) return (
    <div>Carregando...</div>
  )

  if (isError) return (
    <div>Algo deu errado</div>
  )

  return (
    <>
    <SearchBar placeholder="Procure por aqui..."/>
    <Divider />
    <DogsGrid dogsList={data} />
    </>
  )
}
