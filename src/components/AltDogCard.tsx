import { FocusRing, Ripple, useFocusRing } from 'actify';
import IDog from 'common/interfaces/IDog'
import React from 'react'
import { useNavigate } from 'react-router'

interface AltDogCardProps {
    dog: IDog
}

export default function AltDogCard({ dog }: AltDogCardProps) {
    const navigate = useNavigate();
    const { isFocusVisible, focusProps } = useFocusRing();
    const ref = React.useRef<HTMLDivElement>(null);

    const onKeyPressed: React.KeyboardEventHandler<HTMLDivElement> = e => {
        if (e.key == " " || e.key == "Enter")
            ref.current?.click();
    }

    return (
    <div role='link' {...focusProps} tabIndex={0} className='rounded-lg mt-2 p-4 shadow-md cursor-pointer min-w-[165px] w-[165px] relative focus:outline-0'
    onClick={() => navigate(`/dogdetails/${dog.id}`)} onKeyUp={onKeyPressed} ref={ref}
    style={{backgroundColor: "white"}}>
        <Ripple />
        <div className="rounded-lg w-full h-[5rem] flex items-center justify-center font-bold text-[1.5rem] mb-2"
        style={{backgroundColor: "rgb(var(--md-sys-color-surface-variant))", color: "rgb(var(--md-sys-color-primary))"}}>
            {dog.name.charAt(0)}
        </div>
        <span className='mt-2 font-normal'>{dog.name}</span>
        { isFocusVisible && <FocusRing /> }
    </div>
    )
}
