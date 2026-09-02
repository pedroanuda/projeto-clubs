import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { deleteDog, getBreeds, getDog, updateDog } from 'common/services/dogService';
import { getOwners } from 'common/services/ownerService';
import { Button, Icon, IconButton, Radio, RadioGroup, Select, SelectOption, TextField } from 'actify';
import StylishDialog from 'components/StylishDialog';
import { useSnackbar } from 'common/contexts/SnackbarContext';
import IPet from 'common/interfaces/IPet';
import IOwner from 'common/interfaces/IOwner';
import React from 'react';
import clsx from 'clsx';
import ErrorPage from '../ErrorPage';

const boxesStyle: React.CSSProperties = {
  backgroundColor: 'var(--md-sys-color-surface-container)',
  color: 'var(--md-sys-color-on-surface-container)',
};

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = React.useState(false);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const [openedArchiveDialog, setOpenedArchiveDialog] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [ownerId, setOwnerId] = React.useState('');
  const [breedId, setBreedId] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [birthday, setBirthday] = React.useState('');
  const [isPackage, setIsPackage] = React.useState<'yes' | 'no'>('no');
  const [packPrice, setPackPrice] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [picturePath, setPicturePath] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Queries
  const { data: pet, isPending, isError } = useQuery({
    queryKey: ['pet', id],
    queryFn: () => (id ? getDog(id) : null),
  });

  const breedsQuery = useQuery({
    queryKey: ['breeds'],
    queryFn: getBreeds,
  });

  const ownersQuery = useQuery({
    queryKey: ['owners'],
    queryFn: () => getOwners({ onlyIdAndName: true }),
  });

  // Populate state on load or when pet data changes
  React.useEffect(() => {
    if (pet) {
      setName(pet.name || '');
      setOwnerId(pet.owners?.[0]?.id || '');
      setBreedId(pet.breed_id ? pet.breed_id.toString() : '');
      setGender(pet.gender || 'male');
      setBirthday(pet.birthday || '');
      setIsPackage(pet.default_pack_price ? 'yes' : 'no');
      setPackPrice(pet.default_pack_price ? pet.default_pack_price.toString() : '');
      setNotes(pet.notes || '');
      setPicturePath(pet.picture_path || null);
    }
  }, [pet]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !pet) return;
      const ownerInfo = ownersQuery.data?.find((o: IOwner) => o.id === ownerId);
      const breedNum = parseInt(breedId, 10);
      const selectedBreed = breedsQuery.data?.find((b: any) => b.id === breedNum);

      const updatedPet: IPet = {
        ...pet,
        id,
        name: name.trim(),
        breed_id: breedNum || pet.breed_id,
        breed_name: selectedBreed?.name || pet.breed_name,
        gender: gender || pet.gender,
        owners: ownerInfo ? [{ id: ownerInfo.id, name: ownerInfo.name }] : pet.owners,
        birthday: birthday || null,
        default_pack_price: isPackage === 'yes' && packPrice ? parseFloat(packPrice) : null,
        notes: notes ? notes.trim() : null,
        picture_path: picturePath,
      };

      await updateDog(updatedPet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      queryClient.invalidateQueries({ queryKey: ['dogos'] });
      if (ownerId) {
        queryClient.invalidateQueries({ queryKey: ['ownerDogs', ownerId] });
      }
      openSnackbar('Pet atualizado com sucesso!', 'success');
      setEditMode(false);
    },
    onError: (err) => {
      openSnackbar('Erro ao atualizar dados do pet.', 'error');
      console.error('Error updating pet:', err);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !pet) return;
      const newStatus = pet.status === 'archived' ? 'active' : 'archived';
      await updateDog({
        ...pet,
        status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      queryClient.invalidateQueries({ queryKey: ['dogos'] });
      openSnackbar(
        pet?.status === 'archived' ? 'Pet desarquivado com sucesso!' : 'Pet arquivado com sucesso!',
        'success'
      );
      setOpenedArchiveDialog(false);
    },
    onError: (err) => {
      openSnackbar('Erro ao alterar status do pet.', 'error');
      setOpenedArchiveDialog(false);
      console.error(err);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await deleteDog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogos'] });
      openSnackbar('Pet deletado com sucesso.', 'success');
      setOpenedDeleteDialog(false);
      navigate('/');
    },
    onError: (err) => {
      openSnackbar('Erro ao deletar pet.', 'error');
      setOpenedDeleteDialog(false);
      console.error(err);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePath(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isPending) {
    return <div className="p-6 text-center text-on-surface">Carregando dados do pet...</div>;
  }

  if (isError || !pet) {
    return (
      <ErrorPage
        title="Erro ao visualizar pet"
        subtitle="Não foi possível carregar os dados deste pet."
        locationTo="/"
        buttonText="Ir para página inicial"
      />
    );
  }

  const isArchived = pet.status === 'archived';

  return (
    <div className="p-4 pt-2 h-full box-border max-w-full outline-0 text-on-surface">
      {/* Hidden File Input for Picture Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Sticky Action Bar */}
      <div
        className="flex items-center justify-between w-full sticky top-0 py-2 z-10"
        style={{ backgroundColor: 'var(--md-sys-color-surface)' }}
      >
        <div className="flex grow gap-3 items-center min-h-[48px]">
          <IconButton onPress={() => navigate(-1)} aria-label="Voltar">
            <Icon>Arrow_Back</Icon>
          </IconButton>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{editMode ? 'Editando Pet' : pet.name}</h2>
            <span
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-full select-none',
                isArchived
                  ? 'bg-outline-variant text-on-surface-variant'
                  : 'bg-primary-container text-on-primary-container'
              )}
            >
              {isArchived ? 'Arquivado' : 'Ativo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {editMode ? (
            <>
              <IconButton
                onPress={() => {
                  setEditMode(false);
                  if (pet) {
                    setName(pet.name || '');
                    setOwnerId(pet.owners?.[0]?.id || '');
                    setBreedId(pet.breed_id ? pet.breed_id.toString() : '');
                    setGender(pet.gender || 'male');
                    setBirthday(pet.birthday || '');
                    setIsPackage(pet.default_pack_price ? 'yes' : 'no');
                    setPackPrice(pet.default_pack_price ? pet.default_pack_price.toString() : '');
                    setNotes(pet.notes || '');
                    setPicturePath(pet.picture_path || null);
                  }
                }}
                aria-label="Cancelar edição"
              >
                <Icon>Close</Icon>
              </IconButton>
              <IconButton
                onPress={() => saveMutation.mutate()}
                aria-label="Salvar alterações"
                style={{ color: 'var(--md-sys-color-primary)' }}
              >
                <Icon>Save</Icon>
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onPress={() => setEditMode(true)} aria-label="Editar">
                <Icon>Edit</Icon>
              </IconButton>
              <IconButton
                onPress={() => setOpenedArchiveDialog(true)}
                aria-label={isArchived ? 'Desarquivar' : 'Arquivar'}
              >
                <Icon>{isArchived ? 'Unarchive' : 'Archive'}</Icon>
              </IconButton>
              <IconButton
                onPress={() => setOpenedDeleteDialog(true)}
                aria-label="Deletar"
                style={{ color: 'var(--md-sys-color-error)' }}
              >
                <Icon>Delete</Icon>
              </IconButton>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {/* Main Information Box */}
        <div className="rounded-lg p-4" style={boxesStyle}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Pet Picture */}
            <div className="relative group self-center md:self-start">
              {picturePath ? (
                <img
                  src={picturePath}
                  alt={name || pet.name}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-outline-variant"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-surface-variant text-on-surface-variant flex items-center justify-center text-4xl font-bold border-2 border-outline-variant select-none">
                  {(name || pet.name || 'P')[0].toUpperCase()}
                </div>
              )}

              {/* Edit Image Overlay */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                title="Alterar foto"
              >
                <Icon>Photo_Camera</Icon>
                <span className="text-xs font-medium mt-1">Alterar Foto</span>
              </button>
            </div>

            {/* Pet Details / Form Fields */}
            <div className="grow w-full flex flex-col gap-4">
              {editMode ? (
                <>
                  <TextField
                    label="Nome do Pet"
                    value={name}
                    onChange={(val) => setName(val)}
                    variant="outlined"
                    isRequired
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Tutor / Dono"
                      selectedKey={ownerId}
                      onSelectionChange={(key) => setOwnerId(key?.toString() ?? '')}
                      variant="outlined"
                      isRequired
                    >
                      {ownersQuery.data?.map((owner: IOwner) => (
                        <SelectOption key={owner.id}>{owner.name}</SelectOption>
                      ))}
                    </Select>

                    <Select
                      label="Raça"
                      selectedKey={breedId}
                      onSelectionChange={(key) => setBreedId(key?.toString() ?? '')}
                      variant="outlined"
                      isRequired
                    >
                      {breedsQuery.data?.map((b: any) => (
                        <SelectOption key={b.id.toString()}>{b.name}</SelectOption>
                      ))}
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Sexo"
                      selectedKey={gender}
                      onSelectionChange={(key) => setGender(key?.toString() ?? '')}
                      variant="outlined"
                      isRequired
                    >
                      <SelectOption key="male">Macho</SelectOption>
                      <SelectOption key="female">Fêmea</SelectOption>
                    </Select>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-outline select-none">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-outline bg-transparent text-on-surface focus:outline-none focus:border-primary text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-outline block font-medium">Nome</span>
                    <span className="text-base font-semibold">{pet.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-outline block font-medium">Tutor / Dono</span>
                    <span className="text-base font-semibold">
                      {pet.owners?.[0]?.name || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-outline block font-medium">Raça</span>
                    <span className="text-base font-semibold">{pet.breed_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-outline block font-medium">Sexo</span>
                    <span className="text-base font-semibold">
                      {pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Fêmea' : pet.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-outline block font-medium">Data de Nascimento</span>
                    <span className="text-base font-semibold">
                      {pet.birthday ? new Date(pet.birthday).toLocaleDateString() : 'Não informada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-outline block font-medium">Status</span>
                    <span className="text-base font-semibold">
                      {isArchived ? 'Arquivado' : 'Ativo'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Package & Billing Surface Box */}
        <div className="rounded-lg p-4" style={boxesStyle}>
          <h6 className="font-semibold text-lg mb-3">Pacote & Mensalidade</h6>
          {editMode ? (
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-on-surface select-none">
                Faz parte de um pacote?
              </label>
              <RadioGroup
                name="isFromAPackage"
                orientation="horizontal"
                value={isPackage}
                onChange={(val) => setIsPackage(val as 'yes' | 'no')}
              >
                <Radio value="no">Não</Radio>
                <Radio value="yes">Sim</Radio>
              </RadioGroup>

              {isPackage === 'yes' && (
                <TextField
                  label="Valor do Pacote (R$)"
                  type="number"
                  value={packPrice}
                  onChange={(val) => setPackPrice(val)}
                  variant="outlined"
                  placeholder="0.00"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-xs text-outline block font-medium">Possui Pacote Ativo</span>
                <span className="text-base font-semibold">
                  {pet.default_pack_price ? 'Sim' : 'Não'}
                </span>
              </div>
              {pet.default_pack_price && (
                <div className="mt-1">
                  <span className="text-xs text-outline block font-medium">Valor do Pacote</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {pet.default_pack_price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Future Extensibility Container: History & Logs */}
        <div className="rounded-lg p-4" style={boxesStyle}>
          <div className="flex items-center justify-between mb-2">
            <h6 className="font-semibold text-lg">Histórico & Frequência</h6>
            <span className="text-xs text-outline">Em breve</span>
          </div>
          <p className="text-sm text-outline">
            Registros de banhos, tosas, histórico de pacotes e frequência serão exibidos nesta área.
          </p>
        </div>

        {/* Notes Surface Box */}
        <div className="rounded-lg p-4" style={boxesStyle}>
          <h6 className="font-semibold text-lg mb-3">Anotações / Observações</h6>
          {editMode ? (
            <TextField
              label="Observações"
              type="textarea"
              value={notes}
              onChange={(val) => setNotes(val)}
              variant="outlined"
            />
          ) : (
            <p className="text-sm whitespace-pre-line">
              {pet.notes ? pet.notes : 'Nenhuma observação registrada.'}
            </p>
          )}
        </div>
      </div>

      {/* Dialog: Confirm Archive / Unarchive */}
      <StylishDialog open={openedArchiveDialog} onClose={() => setOpenedArchiveDialog(false)}>
        <h6 className="text-lg font-bold">
          {isArchived ? `Desarquivar ${pet.name}?` : `Arquivar ${pet.name}?`}
        </h6>
        <p className="mt-2 text-sm">
          {isArchived
            ? `Ao confirmar, ${pet.name} voltará para a lista de pets ativos.`
            : `Ao confirmar, ${pet.name} será movido para o arquivo.`}
        </p>
        <div className="flex items-center justify-end mt-4 gap-2">
          <Button variant="text" onPress={() => setOpenedArchiveDialog(false)}>
            Cancelar
          </Button>
          <Button variant="tonal" onPress={() => archiveMutation.mutate()}>
            Confirmar
          </Button>
        </div>
      </StylishDialog>

      {/* Dialog: Confirm Delete */}
      <StylishDialog open={openedDeleteDialog} onClose={() => setOpenedDeleteDialog(false)}>
        <h6 className="text-lg font-bold text-error">Apagar {pet.name}?</h6>
        <p className="mt-2 text-sm">
          Esta ação não pode ser desfeita. Todos os dados cadastrais do pet serão permanentemente removidos.
        </p>
        <div className="flex items-center justify-end mt-4 gap-2">
          <Button variant="text" onPress={() => setOpenedDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="tonal"
            onPress={() => deleteMutation.mutate()}
            style={{ backgroundColor: 'var(--md-sys-color-error)', color: 'white' }}
          >
            Deletar
          </Button>
        </div>
      </StylishDialog>
    </div>
  );
}
