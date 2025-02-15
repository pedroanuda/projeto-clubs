import { Icon, IconButton } from 'actify';
import React from 'react'

interface StylishSnackProps {
    /** Text that will be displayed on the snackbar. */
    text: string,
    /** The position the snackbar will appear on screen. @default 'bottom-right' */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    /** A possible variation that changes the color and the icon. @default 'neutral' */
    variation?: 'neutral' | 'success' | 'error',
    /** If true, the Snackbar will close itself 5 seconds after opened. @default true */
    closeByItself?: boolean,
    open?: boolean,
    onClose?: () => void
}

export default function StylishSnack({ text, open, onClose, position = "bottom-right", variation = "neutral", closeByItself = true}: StylishSnackProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const positionClasses = {
        "top-left": {
            positionNames: "top-0 left-0",
            openedTranslate: "translate-x-0",
            closedTranslate: "-translate-x-full",
        },
        "top-right": {
            positionNames: "top-0 right-0",
            openedTranslate: "translate-x-0",
            closedTranslate: "translate-x-full"
        },
        "bottom-left": {
            positionNames: "bottom-0 left-0",
            openedTranslate: "translate-x-0",
            closedTranslate: "-translate-x-full"
        },
        "bottom-right": {
            positionNames: "bottom-0 right-0",
            openedTranslate: "translate-x-0",
            closedTranslate: "translate-x-full"
        }
    };

    const possibleIcons = {
        "neutral": "Info",
        "success": "Check_Circle",
        "error": "Error"
    }

    const snackTheme = {
        "neutral": {
            border: "2px solid rgb(var(--md-sys-color-primary))",
            color: "rgb(var(--md-sys-color-primary))"
        } as React.CSSProperties,
        "success": {
            border: "2px solid #368a0a",
            color: "#368a0a"
        } as React.CSSProperties,
        "error": {
            border: "2px solid rgb(var(--md-sys-color-error))",
            color: "rgb(var(--md-sys-color-error))"
        } as React.CSSProperties
    }

    let timer: NodeJS.Timeout | undefined;
    React.useEffect(() => {
        if (open) {
            ref.current?.classList.remove("hidden");
            setTimeout(() => {
                ref.current?.classList.remove(positionClasses[position].closedTranslate, "opacity-0");
                ref.current?.classList.add(positionClasses[position].openedTranslate, "opacity-100");
            }, 10);

            if (closeByItself) 
                timer = setTimeout(() => onClose && onClose(), 5000);
        } else {
            ref.current?.classList.remove("opacity-100", positionClasses[position].openedTranslate);
            ref.current?.classList.add("opacity-0", positionClasses[position].closedTranslate);
            setTimeout(() => ref.current?.classList.add("hidden"), 500)
        }
    }, [open])

    return (
    <div ref={ref} className={`${positionClasses[position].positionNames} m-4 fixed z-2 items-center p-4 bg-white rounded-lg
    shadow-md min-w-1/3 max-w-3/4 justify-between transform transition-all
    duration-500 ease-in-out flex`}
    style={snackTheme[variation]}>
        <div className='flex items-center gap-2'>
            <Icon>{possibleIcons[variation]}</Icon>
            <span className='text-md truncate'>{text}</span>
        </div>
        <IconButton onPress={() => {clearTimeout(timer); if (onClose) onClose()}}>
            <Icon>Close</Icon>
        </IconButton>
    </div>
    )
}
