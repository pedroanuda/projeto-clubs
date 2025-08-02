import { ReactElement } from "react";
import AddDogDialog from "./AddDogDialog";
import StylishDialog from "components/StylishDialog";

interface FormDialogProps {
    open: boolean,
    onClose: () => void,
    formOptions?: 'addDog'
}

export default function FormDialog({ open, onClose, formOptions = 'addDog' }: FormDialogProps) {
    let content: ReactElement;

    switch (formOptions) {
        case 'addDog':
        default:
            content = <AddDogDialog handleClose={onClose} />;
            break;
    }

    return (
    <>
        <StylishDialog open={open} onClose={onClose}>
            {content}
        </StylishDialog>
    </>
    )
}
