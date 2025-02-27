import { ListItemButton, ListItemIcon, ListItemText, SvgIcon } from '@mui/material'
import { Icon, Ripple } from 'actify'
import React from 'react'

interface DetailsActionProps {
    action: () => void,
    text: string,
    icon: typeof SvgIcon | string
}

export default function DetailsAction({ text, icon, action }: DetailsActionProps) {
  return (
    <button className='flex items-center gap-2 py-3 px-3 rounded-[12px] cursor-pointer relative font-medium hover:shadow-md transition'
    style={{color: "rgb(var(--md-sys-color-on-secondary))", backgroundColor: "rgb(var(--md-sys-color-secondary))"}} onClick={action}>
      <Ripple />
      {typeof icon == "string"
      && <Icon>{icon}</Icon>}
      {text}
    </button>
  )
}
