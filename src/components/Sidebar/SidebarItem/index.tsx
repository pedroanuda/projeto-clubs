import { useLocation, useNavigate } from 'react-router';
import { FocusRing, Icon, Ripple, useFocusRing } from 'actify';
import styles from "./SidebarItem.module.css";
import React from 'react';

interface SidebarItemProps {
    /** That's what appears on the sidebar when it's collapsed. It's super important because of that. */
    icon: React.JSX.Element | string,
    /** Acts like the item's label.*/
    text?: string,
    /** That's where the item will bring the user to. It acts together with the route system, so the link should be something like "/link" */
    link?: string,
    /** This is used to know if the item is a Burguer Menu or something like that. */
    isDrawerOpener?: boolean,
    /** An object that contains what comes from {@link React.useState}. */
    stateConfig?: {
        drawerOpened: boolean,
        drawerSetter: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void)
    }
}

export default function SidebarItem({ text, icon: SvgIcon, link, isDrawerOpener, stateConfig }: SidebarItemProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = link && (link != "/" ? location.pathname.startsWith(link) : link == location.pathname);
    const burguerStyle = {width: "calc(3.5rem - .5rem)"} as React.CSSProperties;
    const { focusProps, isFocusVisible } = useFocusRing();

    const handleClick = () => {
        if (stateConfig) {
            isDrawerOpener
            ? stateConfig.drawerSetter(!stateConfig.drawerOpened)
            : (stateConfig.drawerOpened && stateConfig.drawerSetter(false));
        }
        if (link && location.pathname !== link) {
            navigate(link);
        }
    }

    return (
    <button onClick={handleClick} title={text} style={isDrawerOpener ? burguerStyle : undefined}
    className={`${styles.option} ${isActive ? styles.active : ""}`} {...focusProps}>
        <Ripple />
        <div className="flex items-center justify-center" style={{minWidth: "45px"}}>
            <Icon style={{color: "rgb(var(--md-sys-color-on-secondary-container))"}} className='[--md-icon-size:24px]'>
                {SvgIcon}
            </Icon>
        </div>
        {text && <span style={{color: "rgb(var(--md-sys-color-on-secondary-container))"}}>{text}</span>}
        {isFocusVisible && <FocusRing />}
    </button>
  )
}
