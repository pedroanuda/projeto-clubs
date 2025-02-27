import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { getOwner, saveOwner } from 'common/services/ownerService';
import { Autocomplete, AutocompleteItem, Button, Icon, IconButton, TextField } from 'actify';
import StylishSnack from 'components/StylishSnack';
import { openUrl } from '@tauri-apps/plugin-opener';
import StylishDialog from 'components/StylishDialog';
import { getAllDogs } from 'common/services/dogService';
import AltDogCard from 'components/AltDogCard';
import MaskedTextField from 'components/MaskedTextField';
import DetailsAction from 'components/DetailsAction';
import IOwner from 'common/interfaces/IOwner';
import { ContactInfoList } from 'components/ContactInfo';
import React from 'react';

type TypeOfLink = 'phone' | 'email' | 'address';

const boxesStyle: React.CSSProperties = {
    backgroundColor: "rgb(var(--md-sys-color-surface-container))",
    color: "rgb(var(--md-sys-color-on-surface-container))"
}

interface EditModePageProps {
    ownerInfo: IOwner;
    closeHandler: () => void;
    snackbarOpener?: (text: string, variation?: 'neutral' | 'error' | 'success') => void
}
function EditModePage({ ownerInfo, closeHandler, snackbarOpener }: EditModePageProps) {
    const [name, setName] = React.useState(ownerInfo.name);
    const [phoneNumbers, setPhoneNumbers] = React.useState(ownerInfo.phone_numbers?.map(number => ({...number})));
    const [addresses, setAddresses] = React.useState(ownerInfo.addresses);
    const [email, setEmail] = React.useState(ownerInfo.email);
    const [details, setDetails] = React.useState(ownerInfo.about);
    const phone1Ref = React.useRef<HTMLInputElement>(null);
    const address1Ref = React.useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const saveMutation = useMutation({
        mutationFn: handleSave,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['owner', ownerInfo.id]});
            queryClient.invalidateQueries({queryKey: ['owneros']});
            if (snackbarOpener)
                snackbarOpener(`"${name}" salvo com sucesso!`, 'success');
            closeHandler();
        },
        onError: (e) => {
            if (snackbarOpener) {
                snackbarOpener("Erro ao salvar dono.", 'error');
                console.error(e);
            }
        }
    });

    const onPhone1Blur = () => {
        const value = phone1Ref.current?.value || "";

        if (value.trim() !== "") {
            setPhoneNumbers([{ value }])
        }
    }
    React.useEffect(() => {
        if (addresses && addresses.length > 0) return;
        const ref = address1Ref.current;
        const listener = (e: FocusEvent) => {
            if (ref) {
                setAddresses([ref.value]);
            }
        }
        ref?.addEventListener("blur", listener);
        return () => {
            ref?.removeEventListener("blur", listener);
        }
    }, [addresses?.length])

    async function handleSave() {
        await saveOwner({
            id: ownerInfo.id,
            name,
            about: details,
            addresses: addresses,
            email,
            phone_numbers: phoneNumbers,
            register_date: ownerInfo.register_date
        });
    }

    const handlePhoneChange = (index: number, type: 'value' | 'label' = 'value') => (event: React.ChangeEvent<HTMLInputElement> | string) => {
        if (!phoneNumbers) {
            console.warn(`Couldn't change phoneNumbers state.`);
            return;
        }
        const newPhoneNumbers = [...phoneNumbers];
        newPhoneNumbers[index][type] = typeof event == "string"
        ? event
        : event.target.value;
        setPhoneNumbers(newPhoneNumbers);
    }

    const handleAddressChange = (index: number) => (value: string) => {
        if (!addresses) {
            console.warn(`Couldn't change addresses state.`);
            return;
        }
        const newAdresses = [...addresses];
        newAdresses[index] = value;
        setAddresses(newAdresses);
    }

    const removeItem = (type: 'address' | 'phone', index: number) => {
        if (type == 'address') {
            setAddresses(old => old?.filter((_, idx) => idx != index));
        } else {
            setPhoneNumbers(old => old?.filter((_, idx) => idx != index));
        }
    }

    return <>
    <div className='flex items-center justify-between w-full sticky top-0 py-2 z-2'
    style={{backgroundColor: "rgb(var(--md-sys-color-surface))"}}>
        <div className='flex grow gap-2 items-center'>
            <IconButton onPress={closeHandler} aria-label='Fechar'>
                <Icon>Close</Icon>
            </IconButton>
            <h2 className="text-2xl font-bold">Editando contato</h2>
        </div>
        <DetailsAction action={saveMutation.mutate} icon={"Save"} text="Salvar"/>
    </div>
    <div className='mt-4 flex flex-col gap-4'>
        <TextField label="Nome" variant='outlined' value={name} onChange={e => setName(e)} autoComplete='none' />
        <TextField label="E-mail" value={email ?? ""} onChange={value => setEmail(value)} variant='outlined' autoComplete='none' />
        <div className="flex flex-col gap-3 mb-2">
            {phoneNumbers && phoneNumbers.length > 0
            ? phoneNumbers?.map((phoneNumber, i) => (
            <div className='flex items-center gap-2' key={`div-phone-${i}`}>
                <div className='flex flex-col gap-[.4rem] grow'>
                    <MaskedTextField label="Número de Telefone" variant='outlined' mask="(00) 00000-0000" type="tel"
                    placeholder='(00) 00000-0000' value={phoneNumber.value} onChange={handlePhoneChange(i)}/>
                    <Autocomplete label="Marcador" variant='outlined' allowsCustomValue
                    inputValue={phoneNumber.label} onInputChange={handlePhoneChange(i, 'label')}>
                        <AutocompleteItem>Celular</AutocompleteItem>
                        <AutocompleteItem>Casa</AutocompleteItem>
                        <AutocompleteItem>WhatsApp</AutocompleteItem>
                    </Autocomplete>
                </div>
                <IconButton style={{color: "rgb(var(--md-sys-color-error))"}}
                onPress={() => removeItem('phone', i)}>
                    <Icon>Do_Not_Disturb_On</Icon>
                </IconButton>
            </div>))
            : <div className='flex flex-col gap-[.4rem]'>
            <MaskedTextField label="Número de Telefone" variant='outlined' mask="(00) 00000-0000"
            placeholder='(00) 00000-0000' onBlur={onPhone1Blur} ref={phone1Ref}/>
            <Autocomplete label="Marcador" variant='outlined' allowsCustomValue>
                <AutocompleteItem>Celular</AutocompleteItem>
                <AutocompleteItem>Casa</AutocompleteItem>
                <AutocompleteItem>WhatsApp</AutocompleteItem>
            </Autocomplete>
            </div>}
            <Button variant='text' className="mt-[-11px] ml-[-10px]" 
            style={{width: 'min-content'}} onPress={() => setPhoneNumbers(old => old?.concat([{value: ""}]))}>Adicionar telefone</Button>
        </div>
        <div className='flex flex-col gap-3'>
            {addresses && addresses.length > 0
            ? addresses.map((address, i) => (
                <div className='flex gap-2 items-center' key={`addr-${i}`}>
                    <div className='grow'>
                        <TextField variant='outlined' label={`Endereço ${i+1}`} value={address}
                        onChange={handleAddressChange(i)}/>
                    </div>
                    <IconButton style={{color: "rgb(var(--md-sys-color-error))"}}
                    onPress={() => removeItem('address', i)}>
                        <Icon>Do_Not_Disturb_On</Icon>
                    </IconButton>
                </div>
            ))
            : <div className='flex gap-2 items-center'>
                <div className='grow'>
                    <TextField ref={address1Ref} variant='outlined' label={`Endereço`} />
                </div>
            </div>}
            <Button variant='text' className="mt-[-11px] ml-[-10px]" 
            style={{width: 'min-content'}} onPress={() => setAddresses(old => old?.concat([""]))}>Adicionar endereço</Button>
        </div>
        <TextField label="Anotações" value={details ?? ""} onChange={value => setDetails(value)}
        type='textarea' variant='outlined' />
    </div>
    </>;
}

export default function OwnerDetails() {
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
            ? <EditModePage ownerInfo={{...data}} closeHandler={() => setEditMode(false)} snackbarOpener={openSnackbar}/>
            : <>
            <div className='flex items-center justify-between w-full sticky top-0 py-2 z-2'
            style={{backgroundColor: "rgb(var(--md-sys-color-surface))"}}>
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
