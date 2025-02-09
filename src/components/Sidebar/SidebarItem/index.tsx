import { ListItem, ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
import styles from "./SidebarItem.module.css";
import { useLocation, useNavigate } from 'react-router';
import React from 'react';

interface SidebarItemProps {
    /** That's what appears on the sidebar when it's collapsed. It's super important because of that. */
    icon: typeof SvgIcon,
    /** Acts like the item's label.*/
    text?: string,
    /** That's where the item will bring the user to. It acts together with the route system, so the link should be something like "/link" */
    link?: string,
    /** That's the color that appears when the item is selected. */
    activeColor?: string,
    /** This is used to know if the item is a Burguer Menu or something like that. */
    isDrawerOpener?: boolean,
    /** An object that contains what comes from {@link React.useState}. */
    stateConfig?: {
        drawerOpened: boolean,
        drawerSetter: React.Dispatch<React.SetStateAction<boolean>>
    }
}

export default function SidebarItem({ text, icon, link, activeColor, isDrawerOpener, stateConfig }: SidebarItemProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ListItem 
    className={`${styles.option} ${(location.pathname === link) ? styles.active : ""}`}
    style={{borderLeftColor: activeColor}}
    disablePadding>
        <ListItemButton onClick={() => {
            if (stateConfig) {
                isDrawerOpener
                ? stateConfig.drawerSetter(!stateConfig.drawerOpened)
                : (stateConfig.drawerOpened && stateConfig.drawerSetter(false));
            }
            if (link && location.pathname !== link) {
                navigate(link);
            }}}>
            <ListItemIcon title={text} sx={{minWidth: "45px"}}>
                <SvgIcon component={icon} />
            </ListItemIcon>
            {text && <ListItemText primary={text} />}
        </ListItemButton>
    </ListItem>
  )
}
