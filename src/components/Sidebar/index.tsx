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
    icon: typeof SvgIcon,
    /** That's the link which the user will be taken to when clicking on the section. */
    link?: string
}

export default function Sidebar({ sections, titleBarHeight = "0px" }: SidebarProps) {
    const theme = useTheme();
    const [opened, setOpened] = useState(false);
    
    return (
        <>
        <nav className={`${styles.sidebar} ${opened ? styles.opened : ""}`} style={{"--titlebar-height": titleBarHeight} as CSSProperties}>
            <List className={styles.optionsGroup}>
                <SidebarItem icon={BurguerIcon} isDrawerOpener stateConfig={{drawerOpened: opened, drawerSetter: setOpened}}/>
                {sections && sections.map(section => (
                    <SidebarItem icon={section.icon}
                    activeColor={theme.palette.primary.main}
                    link={section.link}
                    text={section.sectionName}
                    key={section.sectionName}
                    stateConfig={{drawerOpened: opened, drawerSetter: setOpened}} />
                ))}
            </List>
            <List className={styles.optionsGroup}>
                <SidebarItem icon={HelpIcon}
                activeColor={theme.palette.primary.main}
                link="/ajuda"
                text="Ajuda"
                stateConfig={{drawerOpened: opened, drawerSetter: setOpened}} />
            </List>
        </nav>
        <div onClick={() => setOpened(false)} className={`${styles.backdrop} ${opened ? styles.visible : ""}`}></div>
        </>
    )
}
