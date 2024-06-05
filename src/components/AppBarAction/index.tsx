import { SvgIcon } from "@mui/material"
import styles from "./AppBarAction.module.css"

export interface AppBarActionProps {
    icon: typeof SvgIcon,
    name: string,
    disabled?: boolean,
    action?: () => null | void
}

export default function AppBarAction({ icon, name, disabled = false, action = () => null }: AppBarActionProps) {

    return (
        <div className={`${styles.actionDiv} ${disabled ? styles.disabledDiv : ""}`} 
        onClick={disabled ? () => null : action}>
            <SvgIcon component={icon} />
            {name}
        </div>
    )
}
