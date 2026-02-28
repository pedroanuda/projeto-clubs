import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Autocomplete, AutocompleteItem, Button, Icon, IconButton, TextField } from 'actify';
import IOwner from 'common/interfaces/IOwner';
import { addOwner, saveOwner } from 'common/services/ownerService';
import DetailsAction from 'components/DetailsAction';
import MaskedTextField from 'components/MaskedTextField';
import { v4 as uuid4 } from 'uuid';
import React from 'react';
import { useNavigate } from 'react-router';

interface OwnerFormProps {
    ownerInfo?: IOwner;
    closeHandler: () => void;
    snackbarOpener?: (text: string, variation?: 'neutral' | 'error' | 'success') => void
}
export default function OwnerForm({ ownerInfo, closeHandler, snackbarOpener }: OwnerFormProps) {
    const [name, setName] = React.useState(ownerInfo?.name || "");
    const [phoneNumbers, setPhoneNumbers] = React.useState(ownerInfo?.phone_numbers?.map(number => ({...number})));
    const [addresses, setAddresses] = React.useState(ownerInfo?.addresses);
    const [email, setEmail] = React.useState(ownerInfo?.email);
    const [details, setDetails] = React.useState(ownerInfo?.about);
    const [newId, setNewId] = React.useState<string>() // Create mode only.
    const navigate = useNavigate();

    const isEditMode = ownerInfo !== undefined;
    const phone1Ref = React.useRef<HTMLInputElement>(null);
    const address1Ref = React.useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const saveMutation = useMutation({
        mutationFn: handleSave,
        onSuccess: () => {
            if (isEditMode)
                queryClient.invalidateQueries({queryKey: ['owner', ownerInfo.id]});

            queryClient.invalidateQueries({queryKey: ['owneros']});
            if (snackbarOpener)
                snackbarOpener(`"${name}" salvo com sucesso!`, 'success');

            if (isEditMode)
                closeHandler();
            else navigate("../view/" + newId);
        },
        onError: (e) => {
            if (snackbarOpener) {
                snackbarOpener(isEditMode
                    ? "Erro ao salvar dono."
                    : "Erro ao criar dono", 'error');
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
        if (isEditMode) {
            await saveOwner({
                id: ownerInfo.id,
                name: name || "",
                about: details,
                addresses: addresses,
                email,
                phone_numbers: phoneNumbers,
                register_date: ownerInfo.register_date
            });
        } else {
            const id = uuid4();
            setNewId(id);
            await addOwner({
                id,
                name: name || "",
                about: details,
                addresses: addresses,
                email,
                phone_numbers: phoneNumbers,
                register_date: new Date()
            });
        }
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

    return (
    <form onSubmit={e => e.preventDefault()}>
    <div className='flex items-center justify-between w-full sticky top-0 py-2 z-2'
    style={{backgroundColor: "var(--md-sys-color-surface)"}}>
        <div className='flex grow gap-2 items-center'>
            <IconButton onPress={closeHandler} aria-label='Fechar'>
                <Icon>Close</Icon>
            </IconButton>
            <h2 className="text-2xl font-bold">
                {isEditMode ? "Editando" : "Criar"} contato
            </h2>
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
                <IconButton style={{color: "var(--md-sys-color-error)"}}
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
                    <IconButton style={{color: "var(--md-sys-color-error)"}}
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
    </form>);
}