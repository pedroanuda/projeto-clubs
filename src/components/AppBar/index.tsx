import { getCurrentWindow } from "@tauri-apps/api/window";
import { getName } from "@tauri-apps/api/app";
import React, { useState } from "react";
import { MinimizeIcon, MaximizeIcon, CloseIcon, ToggleMaximizeIcon, AddIcon1 } from "common/icons";
import { SvgIcon } from "@mui/material";
import styles from "./AppBar.module.css";
import AppBarAction, { AppBarActionProps } from "components/AppBarAction";
import { useLocation } from "react-router";
import FormDialog from "components/FormDialog";
import { createPortal } from "react-dom";
const appName = await getName();
const appWindow = getCurrentWindow();

export default function AppBar() {
    const [maximizeIcon, setMaximizeIcon] = useState<typeof MaximizeIcon>(MaximizeIcon);
    const [dialogOpen, setDialogOpen] = useState(false);

    const actions: AppBarActionProps[] = useLocation().pathname === "/" ? [
    {icon: AddIcon1, name: "Cadastrar Cachorro", action: () => setDialogOpen(true)}] : []

    return (
    <>
    <div className={styles.titlebar} data-tauri-drag-region>
        {createPortal(
        <div className={styles.titlebarDecoration} data-tauri-drag-region>
            {appName}
        </div>, document.body)}
        {actions.length ?
        <div>
            {actions.map((act, indx) => <AppBarAction icon={act.icon} name={act.name} action={act.action} disabled={dialogOpen} key={indx} />)}
        </div> : null}
        <div>
            <div className={styles.titlebarButton} onClick={() => appWindow.minimize()}>
                <MinimizeIcon />
            </div>
            <div id="maximized" className={styles.titlebarButton} onClick={() => {
                appWindow.toggleMaximize();
                appWindow.isMaximized()
                .then(res => res ? setMaximizeIcon(MaximizeIcon) : setMaximizeIcon(ToggleMaximizeIcon))}}>
                    <SvgIcon component={maximizeIcon} />
            </div>
            <div className={`${styles.titlebarButton} ${styles.closeButton}`} 
            onClick={() => appWindow.close()}>
                <CloseIcon />
            </div>
        </div>
    </div>
    <FormDialog handleClose={() => setDialogOpen(false)} open={dialogOpen} />
    </>
    )
}
