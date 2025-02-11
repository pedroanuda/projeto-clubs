import { Link, useNavigate, useSearchParams } from "react-router";
import { Breadcrumbs, Divider, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import DogsGrid from "components/DogsGrid";
import SearchBar from "components/Searchbar";
import { getAllDogs } from "common/services/dogService";
import React, { Fragment } from "react";

export default function WatchingDogs() {
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search");

  const { data, isPending, isError } = useQuery({
    queryKey: ['dogos', searchQuery],
    queryFn: () => getAllDogs(false, undefined, searchQuery)
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
    <Breadcrumbs separator=">" aria-label="breadcrumb" sx={{margin: "1rem", marginBottom: ".2rem"}}>
      {!searchParams.has("search") 
      ? <Typography>Início</Typography>
      : <Link to="/" onClick={() => setSearchInputValue("")}>Início</Link>}
      {searchParams.has("search") &&
      <Typography>Resultados da pesquisa</Typography>}
    </Breadcrumbs>
    <SearchBar placeholder="Procure por aqui..." value={searchInputValue} 
    onChange={e => setSearchInputValue(e.target.value)} onSubmit={onSearch} 
    style={{paddingTop: 0}}/>
    <Divider />
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
    </>
  )
}
