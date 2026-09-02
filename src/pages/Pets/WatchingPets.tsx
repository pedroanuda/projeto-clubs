import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import SearchBar from 'components/Searchbar';
import { getAllDogs } from 'common/services/dogService';
import { Button, ChipGroup, ChipItem, Icon } from 'actify';
import AddDogDialog from 'components/AddDogDialog';
import React from 'react';
import IPet from 'common/interfaces/IPet';
import PetCard from './PetCard';

function PetsGrid({ pets }: { pets: IPet[] }) {
  return (
    <div
      className="grid gap-4 px-4 pb-4 overflow-y-auto
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}

export default function WatchingPets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const statusQuery = searchParams.get('status') || 'active';

  const [searchInputValue, setSearchInputValue] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setSearchInputValue(searchQuery || '');
  }, [searchQuery]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data, isPending, isError } = useQuery({
    queryKey: ['dogos', searchQuery, statusQuery],
    queryFn: () => getAllDogs(undefined, undefined, undefined, searchQuery, statusQuery),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedValue = searchInputValue.trim();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (trimmedValue !== '') {
        next.set('search', trimmedValue);
      } else {
        next.delete('search');
      }
      return next;
    });
  };

  const handleStatusChange = (keys: unknown) => {
    if (typeof keys === 'string') return;
    const selectedKey = Array.from(keys as Iterable<string>)[0];
    const newStatus = selectedKey || 'all';
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newStatus && newStatus !== 'active') {
        next.set('status', newStatus);
      } else {
        next.delete('status');
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mx-4 mt-4 text-on-surface">
        <h2 className="text-2xl font-bold">Pets</h2>
        <Button
          variant="outlined"
          style={{ paddingInlineStart: '1rem' }}
          onPress={() => setDialogOpen(true)}
        >
          <Icon className={'[--md-icon-size:1.2rem]'}>Add</Icon>
          <span className="text-md">Adicionar pet</span>
        </Button>
      </div>
      <SearchBar
        placeholder="Procure por aqui..."
        value={searchInputValue}
        className="mx-4 mt-2"
        onChange={(e) => setSearchInputValue(e.target.value)}
        onSubmit={onSearch}
      />
      <div className="mx-4 mt-2 pb-4">
        <ChipGroup
          selectionMode="single"
          selectedKeys={[statusQuery]}
          onSelectionChange={handleStatusChange}
        >
          <ChipItem key="all">Todos</ChipItem>
          <ChipItem key="archived">Arquivados</ChipItem>
          <ChipItem key="active">Ativos</ChipItem>
        </ChipGroup>
      </div>
      {isPending ? (
        <div>Carregando...</div>
      ) : isError ? (
        <div>Algo deu errado</div>
      ) : (
        <>
          {searchParams.has('search') && (
            <div style={{ padding: '1rem', paddingBottom: 0 }}>
              <h2 className="text-on-surface">
                Resultados para "{searchParams.get('search')}" ({data.length})
              </h2>
            </div>
          )}
          <PetsGrid pets={data} />
        </>
      )}
      <AddDogDialog onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </div>
  );
}
