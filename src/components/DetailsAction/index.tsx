import { ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'
import React from 'react'

interface DetailsActionProps {
    action: () => void,
    text: string,
    icon: typeof SvgIcon
}

export default function DetailsAction({ text, icon, action }: DetailsActionProps) {
  return (
    <ListItemButton sx={{borderRadius: "10px", backgroundColor: "#fff"}} onClick={action}>
        <ListItemIcon sx={{minWidth: "35px"}}>
            <SvgIcon component={icon} />
        </ListItemIcon>
        <ListItemText primary={text} />
    </ListItemButton>
  )
}
