import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import ContactInfoItem from "./ContactInfoItem";
import IOwner from "common/interfaces/IOwner";
import React from 'react';
import { Icon, ListItem } from "actify";

interface ContactInfoListProps {
    owner: IOwner;
    type?: 'phoneAndEmail' | 'address';
    snackbarOpener?: (text: string, variant?: 'neutral' | 'error' | 'success') => void;
    dialogOpener?: (type: 'phone' | 'email' | 'address', value?: string) => void;
}

export default function ContactInfoList(props: ContactInfoListProps) {
    const { 
        owner,
        type = 'phoneAndEmail',
        dialogOpener: openDialog,
        snackbarOpener: openSnackbar
    } = props;

    const elements: React.ReactElement[] = []
    const phonesExist = owner.phone_numbers && owner.phone_numbers.toString() !== "";
    const emailExist = !!owner.email;

    // Addresses logic
    if (type == "address") {
        owner.addresses?.forEach((adress, idx) => elements.push(
        <ContactInfoItem icon={idx == 0 ? "Location_On" : undefined}
        key={`addr-view-${idx}`}
        onClick={() => openDialog && openDialog('address', adress)}>
            <p className="text-md">{adress}</p>
        </ContactInfoItem>
        ))

        return elements;
    }

    // Phone and Email logic
    if (phonesExist) {
        owner.phone_numbers?.forEach((number, idx) => {
        let phoneActions = [{
            icon: "Content_Copy",
            fn: () => {
                writeText(number.value);

                if (openSnackbar)
                openSnackbar("Número copiado para a área de transferência!")
            }
        }];
        elements.push(
        <ContactInfoItem actions={phoneActions} onClick={() => openDialog && openDialog('phone', number.value)}
        icon={idx == 0 ? "Call" : undefined} key={number.value}>
            <span className='text-md'>{number.value}</span>
            {number.label && 
            <span className='text-md' style={{color: "rgba(var(--md-sys-color-on-surface-variant), 0.75)"}}>
                {number.label}
            </span>}
        </ContactInfoItem>
        )});
    }

    if (emailExist) {
        let emailActions = [{
            icon: "Content_Copy",
            fn: () => {if (owner.email) {
                writeText(owner.email); 

                if (openSnackbar)
                openSnackbar("Email copiado para a área de transferência!")
            }}
        }];
        elements.push(
        <ContactInfoItem actions={emailActions} onClick={() => openDialog && openDialog('email', owner.email ?? "")} icon='Mail'
        key={owner.email}>
            <span className='text-md'>{owner.email}</span>
        </ContactInfoItem>);
    }

    if (!phonesExist && !emailExist) {
        elements.push(
        <React.Fragment key="no-phone-mail">
            <ListItem className='gap-3'>
                <Icon>Call</Icon>
                Sem telefone
            </ListItem>
            <ListItem className='gap-3 rounded-b-lg overflow-hidden'>
                <Icon>Mail</Icon> 
                Sem email
            </ListItem>
        </React.Fragment>
        );
    }

    return elements;
}