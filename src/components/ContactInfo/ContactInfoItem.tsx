import { Icon, IconButton, ListItem } from 'actify'
import React from 'react'

interface ContactInfoItemProps {
    children: React.ReactNode,
    onClick?: () => void,
    actions?: {icon: string, fn: () => void}[],
    icon?: string,
}

const style = {"--md-sys-color-surface-variant": "var(--md-sys-color-surface-container)"};

export default function ContactInfoItem({ icon, actions, onClick, children }: ContactInfoItemProps) {
  return (
    <div className='relative last:rounded-b-lg overflow-hidden' tabIndex={0}>
        <ListItem className='gap-3' style={style as React.CSSProperties}
        onClick={onClick} >
            {icon && <Icon>{icon}</Icon>}
            <div className="flex flex-col" style={{paddingLeft: !icon ? "calc(var(--spacing) * 3 + 24px)" : ""}}>
                {children}
            </div>
        </ListItem>
        <div className='absolute right-0 top-0 h-full flex items-center mr-2'>
            {actions?.map(action => (
                <IconButton className="z-1" onPress={action.fn} key={`${action.icon}_action`}>
                    <Icon>{action.icon}</Icon>
                </IconButton>
            ))}
        </div>
    </div>
  )
}
