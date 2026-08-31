import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { deleteOwner, getOwner } from 'common/services/ownerService';
import { Button, Icon, IconButton } from 'actify';
import { openUrl } from '@tauri-apps/plugin-opener';
import StylishDialog from 'components/StylishDialog';
import { getAllDogs } from 'common/services/dogService';
import AltDogCard from 'components/AltDogCard';
import { ContactInfoList } from 'components/ContactInfo';
import React from 'react';
import OwnerForm from './OwnerForm';
import { useSnackbar } from 'common/contexts/SnackbarContext';
import clsx from 'clsx';

type TypeOfLink = 'phone' | 'email' | 'address';

const boxesStyle: React.CSSProperties = {
  backgroundColor: 'var(--md-sys-color-surface-container)',
  color: 'var(--md-sys-color-on-surface-container)',
};

export default function OwnerDetails(props: { createMode?: boolean }) {
  // Url constants
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Snackbar context & Dialog controllables
  const { openSnackbar } = useSnackbar();
  const [openedDialog, setOpenedDialog] = React.useState(false);
  const [dialogContent, setDialogContent] = React.useState(<></>);
  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);

  // Queries etc
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = React.useState(false);
  const { createMode = false } = props;
  const queryClient = useQueryClient();
  const { data, isPending, isSuccess } = useQuery({
    queryKey: ['owner', id],
    queryFn: () => (id ? getOwner(id) : null),
  });
  const dogsQuery = useQuery({
    queryKey: ['ownerDogs', id],
    queryFn: () => (id ? getAllDogs(false, undefined, id) : null),
  });

  React.useEffect(() => {
    if (searchParams.has('edit')) setEditMode(true);
    else setEditMode(false);
  }, [searchParams, id]);

  const shouldShowUpdateDate =
    data?.update_date && data.update_date.valueOf() != data?.register_date?.valueOf();

  const openDialog = (type: TypeOfLink, value?: string) => {
    setOpenedDialog(true);
    setDialogContent(getDialogContent(type, value));
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await deleteOwner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owneros'] });
      navigate('/owners');
      openSnackbar('Dono deletado com sucesso.', 'success');
      setOpenedDeleteDialog(false);
    },
    onError: () => {
      openSnackbar('Erro ao deletar dono.', 'error');
      setOpenedDeleteDialog(false);
    },
  });

  const getDialogContent = (noticeType: TypeOfLink, value?: string) => {
    const protocol = { phone: 'tel', email: 'mailto' };

    return (
      <>
        <h6 className="text-lg font-bold">
          {noticeType == 'phone'
            ? `Ligar para '${value}'?`
            : noticeType == 'address'
              ? `Pesquisar por endereço?`
              : noticeType == 'email' && `Enviar email para '${value}'?`}
        </h6>
        {noticeType == 'address' && (
          <p className="mt-2">
            Ao confirmar, o endereço "{value}" será pesquisado no Google Maps.
          </p>
        )}
        <div className="flex items-center justify-end mt-4 gap-2">
          <Button variant="text" onPress={() => setOpenedDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="text"
            onPress={() => {
              setOpenedDialog(false);
              if (noticeType != 'address') openUrl(`${protocol[noticeType]}:${value}`);
              else openUrl(`http://maps.google.com/?q=${value?.replace(' ', '+')}`);
            }}
          >
            Confirmar
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="p-4 pt-2 h-full box-border max-w-full outline-0" ref={containerRef}>
      {editMode && data ? (
        <OwnerForm ownerInfo={{ ...data }} closeHandler={() => setEditMode(false)} />
      ) : createMode ? (
        <OwnerForm closeHandler={() => navigate('../')} />
      ) : (
        <>
          <div
            className="flex items-center justify-between w-full sticky top-0 py-2 z-2"
            style={{ backgroundColor: 'var(--md-sys-color-surface)' }}
          >
            <div className="flex grow gap-2 items-center min-h-[48px]">
              <div className="md:hidden">
                <IconButton onPress={() => navigate('../')}>
                  <Icon>Arrow_Back</Icon>
                </IconButton>
              </div>
              <h2 className="text-2xl font-bold">
                {isPending ? 'Carregando...' : data?.name}
              </h2>
            </div>
            {isSuccess && (
              <div className="flex items-center">
                <IconButton onPress={() => setEditMode(true)}>
                  <Icon>Edit</Icon>
                </IconButton>
                <IconButton onPress={() => setOpenedDeleteDialog(true)}>
                  <Icon>Delete</Icon>
                </IconButton>
              </div>
            )}
          </div>
          <div className="rounded-lg mt-2" style={boxesStyle}>
            <h6 className="p-4 font-semibold">Dados de contato</h6>
            {data && <ContactInfoList owner={data} dialogOpener={openDialog} />}
          </div>
          {data?.addresses && (
            <div className="rounded-lg mt-4" style={boxesStyle}>
              <h6 className="p-4 font-semibold">Endereços</h6>
              {<ContactInfoList owner={data} dialogOpener={openDialog} type="address" />}
            </div>
          )}
          <div className="rounded-lg mt-4" style={boxesStyle}>
            <div className="p-4 pb-2 flex items-center justify-between">
              <h6 className="font-semibold">Pets</h6>
              <IconButton style={{ width: '24px', height: '24px' }}>
                <Icon>Add</Icon>
              </IconButton>
            </div>
            <div className="p-4 pt-0 flex gap-4 overflow-x-auto max-w-full">
              {dogsQuery.isLoading && 'Carregando...'}
              {dogsQuery.isSuccess && dogsQuery.data && dogsQuery.data.length > 0
                ? dogsQuery.data.map((dog) => <AltDogCard dog={dog} key={dog.id} />)
                : 'Não há pets'}
            </div>
          </div>

          {data?.about && (
            <div className="rounded-lg mt-4 p-4" style={boxesStyle}>
              <h6 className="font-semibold pb-4">Anotações</h6>
              {data?.about?.split('\n').map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          )}

          {shouldShowUpdateDate && (
            <span className="block text-center pt-4">
              Última atualização em {data.update_date?.toLocaleDateString()} às{' '}
              {data.update_date?.toLocaleTimeString().slice(0, -3)}
            </span>
          )}
          {data?.register_date && (
            <span
              className={clsx('block text-center', shouldShowUpdateDate ? 'pb-4' : 'py-4')}
            >
              Registrado(a) em {data.register_date.toLocaleDateString()}
            </span>
          )}
        </>
      )}

      <StylishDialog open={openedDialog} onClose={() => setOpenedDialog(false)}>
        {dialogContent}
      </StylishDialog>
      <StylishDialog open={openedDeleteDialog} onClose={() => setOpenedDeleteDialog(false)}>
        <h6 className="text-lg font-bold">Apagar {data?.name}?</h6>
        <p className="mt-2">Ao confirmar, o tutor {data?.name} será apagado.</p>
        <div className="flex items-center justify-end mt-4 gap-2">
          <Button variant="text" onPress={() => setOpenedDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button variant="text" onPress={() => deleteMutation.mutate()}>
            Confirmar
          </Button>
        </div>
      </StylishDialog>
    </div>
  );
}
