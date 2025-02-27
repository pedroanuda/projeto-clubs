import { List, SvgIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CSSProperties, useState } from "react";
import { BurguerIcon, HelpIcon } from "common/icons";
import styles from "./Sidebar.module.css";
import SidebarItem from "./SidebarItem";

export interface SidebarProps {
    sections?: SecaoAttr[]
    /** If there's a Title Bar, this will help to decide on how tall the Sidebar will be. */
    titleBarHeight?: string
}

export interface SecaoAttr {
    /** That's what the name of the section will be. */
    sectionName: string,
    /** That's the icon which will be displayed with the name of the section. */
    icon: JSX.Element,
    /** That's the link which the user will be taken to when clicking on the section. */
    link?: string
}

export default function Sidebar({ sections, titleBarHeight = "0px" }: SidebarProps) {
    const theme = useTheme();
    const [opened, setOpened] = useState(false);
    const [readyZ, setReadyZ] = useState(true);
    
    const handleSet = (open: boolean) => {
        setOpened(open);
        
        if (!open) setTimeout(() => setReadyZ(true), 300);
        else setReadyZ(false);
    }

    return (
        <>
        <div onClick={() => handleSet(false)} className={`${styles.backdrop} ${opened ? styles.visible : ""}`}></div>
        <nav className={`${styles.sidebar} ${opened ? styles.opened : ""}`} 
        style={{zIndex: readyZ ? 0 : 3, "--titlebar-height": titleBarHeight} as CSSProperties}>
            <ul className={styles.optionsGroup}>
                <SidebarItem icon={<BurguerIcon />} isDrawerOpener stateConfig={{drawerOpened: opened, drawerSetter: handleSet}}/>
                {sections && sections.map(section => (
                    <SidebarItem icon={section.icon}
                    activeColor={theme.palette.primary.main}
                    link={section.link}
                    text={section.sectionName}
                    key={section.sectionName}
                    stateConfig={{drawerOpened: opened, drawerSetter: handleSet}} />
                ))}
            </ul>
            <ul className={styles.optionsGroup}>
                <SidebarItem icon={"Settings"}
                activeColor={theme.palette.primary.main}
                link="/settings"
                text="Configurações"
                stateConfig={{drawerOpened: opened, drawerSetter: setOpened}} />
                <SidebarItem icon={<HelpIcon />}
                activeColor={theme.palette.primary.main}
                link="/ajuda"
                text="Ajuda"
                stateConfig={{drawerOpened: opened, drawerSetter: setOpened}} />
            </ul>
        </nav>
        </>
    )
}
