import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { getOwner } from 'common/services/ownerService';
import { Button, Icon, IconButton} from 'actify';
import StylishSnack from 'components/StylishSnack';
import { openUrl } from '@tauri-apps/plugin-opener';
import StylishDialog from 'components/StylishDialog';
import { getAllDogs } from 'common/services/dogService';
import AltDogCard from 'components/AltDogCard';
import { ContactInfoList } from 'components/ContactInfo';
import React from 'react';
import OwnerForm from './OwnerForm';

type TypeOfLink = 'phone' | 'email' | 'address';

const boxesStyle: React.CSSProperties = {
    backgroundColor: "var(--md-sys-color-surface-container)",
    color: "var(--md-sys-color-on-surface-container)"
}

export default function OwnerDetails(props: {createMode?: boolean}) {
    // Url constants
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Snackbar and Dialog controllables
    const [openedSnackbar, setOpenedSnackbar] = React.useState(false);
    const [snackbarVariant, setSnackbarVariant] = React.useState<'neutral' | 'error' | 'success'>();
    const [snackbarText, setSnackbarText] = React.useState("");
    const [openedDialog, setOpenedDialog] = React.useState(false);
    const [dialogContent, setDialogContent] = React.useState(<></>);
    
    // Queries etc
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [editMode, setEditMode] = React.useState(false);
    const { createMode = false } = props;
    const { data, isPending, isSuccess } = useQuery({
        queryKey: ['owner', id],
        queryFn: () => id ? getOwner(id) : null
    })
    const dogsQuery = useQuery({
        queryKey: ['ownerDogs', id],
        queryFn: () => id ? getAllDogs(false, undefined, id) : null
    })

    React.useEffect(() => {
        if (searchParams.has("edit"))
            setEditMode(true);
        else setEditMode(false)
    }, [searchParams, id]);

    const openSnackbar = (text: string, variation?: 'neutral' | 'error' | 'success') => {
        setOpenedSnackbar(true);
        setSnackbarVariant(variation);
        setSnackbarText(text);
    }

    const openDialog = (type: TypeOfLink, value?: string) => {
        setOpenedDialog(true);
        setDialogContent(getDialogContent(type, value));
    }

    const getDialogContent = (noticeType: TypeOfLink, value?: string) => {
        const protocol = {'phone': 'tel', 'email': 'mailto'}

        return (<>
        <h6 className="text-lg font-bold">
            {noticeType == 'phone' ? `Ligar para '${value}'?`
            : noticeType == 'address' ? `Pesquisar por endereço?`
            : noticeType == 'email' && `Enviar email para '${value}'?`}
        </h6>
        {noticeType == 'address' &&
        <p className="mt-2">Ao confirmar, o endereço "{value}" será pesquisado no Google Maps.</p>}
        <div className='flex items-center justify-end mt-4 gap-2'>
            <Button variant='text' onPress={() => setOpenedDialog(false)}>Cancelar</Button>
            <Button variant='text' onPress={() => {
                setOpenedDialog(false);
                if (noticeType != 'address') openUrl(`${protocol[noticeType]}:${value}`);
                else openUrl(`http://maps.google.com/?q=${value?.replace(" ", "+")}`)
            }}>
                Confirmar
            </Button>
        </div>
        </>
    )};

    return (
        <div className='p-4 pt-2 h-full box-border max-w-full outline-0' ref={containerRef}>
            {editMode && data
            ? <OwnerForm ownerInfo={{...data}} closeHandler={() => setEditMode(false)} snackbarOpener={openSnackbar}/>
            : createMode
            ? <OwnerForm closeHandler={() => navigate("../")} snackbarOpener={openSnackbar}/>
            : <>
            <div className='flex items-center justify-between w-full sticky top-0 py-2 z-2'
            style={{backgroundColor: "var(--md-sys-color-surface)"}}>
                <div className='flex grow gap-2 items-center min-h-[48px]'>
                    <div className='md:hidden'>
                        <IconButton onPress={() => navigate("../")}>
                            <Icon>Arrow_Back</Icon>
                        </IconButton>
                    </div>
                    <h2 className="text-2xl font-bold">
                        {isPending ? "Carregando..." : data?.name}
                    </h2>
                </div>
                {isSuccess &&
                <IconButton onPress={() => setEditMode(true)}>
                    <Icon>Edit</Icon>
                </IconButton>}
            </div>
            <div className="rounded-lg mt-2" style={boxesStyle}>
                <h6 className="p-4 font-semibold">Dados de contato</h6>
                {data && <ContactInfoList owner={data} dialogOpener={openDialog} 
                snackbarOpener={openSnackbar} />}
            </div>
            {data?.addresses &&
            <div className="rounded-lg mt-4" style={boxesStyle}>
                <h6 className="p-4 font-semibold">Endereços</h6>
                {<ContactInfoList owner={data} dialogOpener={openDialog}
                snackbarOpener={openSnackbar} type='address' />}
            </div>}
            <div className="rounded-lg mt-4" style={boxesStyle}>
                <div className="p-4 pb-2 flex items-center justify-between">
                    <h6 className="font-semibold">Cachorros</h6>
                    <IconButton style={{width: '24px', height: '24px'}}><Icon>Add</Icon></IconButton>
                </div>
                <div className='p-4 pt-0 flex gap-4 overflow-x-auto max-w-full'>
                    {dogsQuery.isLoading && "Carregando..."}
                    {(dogsQuery.isSuccess && dogsQuery.data && dogsQuery.data.length > 0)
                    ? dogsQuery.data.map(dog => (
                        <AltDogCard dog={dog} key={dog.id} />
                    ))
                    : "Não há cachorros"}
                </div>
            </div>

            {data?.about && 
            <div className="rounded-lg mt-4 p-4" style={boxesStyle}>
                <h6 className="font-semibold pb-4">Anotações</h6>
                {data?.about?.split("\n").map((text, i) => (
                    <p key={i}>{text}</p>
                ))}
            </div>}
            
            {data?.register_date &&
            <span className='block text-center py-4'>
                Registrado(a) em {data.register_date.toLocaleDateString()}
            </span>}
            </>}

            <StylishSnack variation={snackbarVariant} text={snackbarText} open={openedSnackbar} onClose={() => setOpenedSnackbar(false)}/>
            <StylishDialog open={openedDialog} onClose={() => setOpenedDialog(false)}>
                {dialogContent}
            </StylishDialog>
        </div>
    )
}
