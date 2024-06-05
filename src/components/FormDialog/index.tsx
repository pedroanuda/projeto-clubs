import { Dialog } from "@mui/material"
import { ReactElement } from "react";
import AddDogDialog from "./AddDogDialog";
import styles from "./FormDialog.module.css";

interface FormDialogProps {
    open: boolean,
    handleClose: () => void,
    formOptions?: 'addDog' | 'addOwner'
}

export default function FormDialog({ open, handleClose, formOptions = 'addDog' }: FormDialogProps) {
    let content: ReactElement;

    switch (formOptions) {
        case 'addDog':
        default:
            content = <AddDogDialog handleClose={handleClose}/>;
            break;
    }

    return (
    <>
        <Dialog open={open} onClose={handleClose} className={styles.dialog}
        slotProps={{backdrop: {sx: {top: "40px"}}}} scroll="paper">
            {content}
        </Dialog>
    </>
    )
}
