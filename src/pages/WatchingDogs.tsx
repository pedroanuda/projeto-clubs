import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import DogsGrid from "components/DogsGrid";
import SearchBar from "components/Searchbar";
import { getAllDogs } from "common/services/dogService";
import { Button, Icon } from "actify";
import AddDogDialog from "components/AddDogDialog";
import React from "react";

export default function WatchingDogs() {
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data, isPending, isError } = useQuery({
    queryKey: ['dogos', searchQuery],
    queryFn: () => getAllDogs(false, undefined, undefined, searchQuery)
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = searchInputValue.trim();
    navigate(trimmedValue !== "" 
      ? {search: `?search=${trimmedValue}`}
      : ""
    );
  }

  return (
    <>
    <div className="flex items-center justify-between mx-4 mt-4">
      <h2 className="text-2xl font-bold">Cachorros</h2>
      <Button variant='outlined' style={{paddingInlineStart: "1rem"}}
      onPress={() => setDialogOpen(true)}>
        <Icon className={"[--md-icon-size:1.2rem]"}>Add</Icon>
        <span className='text-md'>Adicionar cachorro</span>
      </Button>
    </div>
    <SearchBar placeholder="Procure por aqui..." value={searchInputValue} className="mx-4 mt-2"
    onChange={e => setSearchInputValue(e.target.value)} onSubmit={onSearch} />
    {isPending
    ? <div>Carregando...</div>
    : isError
    ? <div>Algo deu errado</div>
    : <>
      {searchParams.has("search") && 
      <div style={{padding: "1rem", paddingBottom: 0}}>
        <h2>Resultados para "{searchParams.get("search")}" ({data.length})</h2>
      </div>
      }
      <DogsGrid dogsList={data} />
      </>}
      <Button className={"ml-4"}
      onPress={() => document.querySelector(":root")?.classList.toggle("pink")}>
        Alternar tema
      </Button>
      <AddDogDialog onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </>
  )
}
