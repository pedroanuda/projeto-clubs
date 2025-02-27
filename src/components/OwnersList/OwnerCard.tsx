import IOwner from 'common/interfaces/IOwner'
import stc from 'string-to-color'
import { FocusRing, Icon, IconButton, Ripple, useFocusRing } from 'actify'
import { useParams } from 'react-router'
import React from 'react'

interface OwnerCardProps {
    owner: IOwner,
    onClick?: React.MouseEventHandler<HTMLDivElement>,
    onEditClick?: () => void
}

export default function OwnerCard({owner, onClick, onEditClick}: OwnerCardProps) {
  const profilePicColor = stc(owner.id);
  const routeParams = useParams();
  const ref = React.useRef<HTMLDivElement>(null);
  const { isFocusVisible, focusProps } = useFocusRing();
  const backgroundColor = routeParams.id == owner.id 
  ? "rgb(var(--md-sys-color-surface-container-high))"
  : "";

  React.useEffect(() => {
    const listener = () => ref.current?.click();
    ref.current?.addEventListener("keypress", listener);

    return () => ref.current?.removeEventListener("keypress", listener);
  }, []) 

  return (
    <div className='relative group h-min'>
      <div tabIndex={0} onClick={onClick} role="link" ref={ref} {...focusProps}
      className={`relative peer rounded-lg p-2 cursor-pointer flex gap-4 align-middle items-center mx-2
      outline-0`} style={{backgroundColor: backgroundColor}}>
          <Ripple />
          <div className={`select-none rounded-[50%] w-12 h-12 flex items-center justify-center font-medium text-white text-[1.025rem]`} 
          style={{backgroundColor: profilePicColor}}>
            {owner.name.charAt(0).toLocaleUpperCase()}
          </div>
          <span className='align-middle text-lg'>
            {owner.name}
          </span>
          {isFocusVisible && <FocusRing />}
      </div>
      <div className="hidden group-hover:flex peer-focus:flex items-center h-full absolute right-4 top-0">
        <IconButton onPress={onEditClick}>
          <Icon>Edit</Icon>
        </IconButton>
      </div>
    </div>
  )
}
