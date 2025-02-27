import React from 'react'

interface StylishDialogProps {
    open?: boolean,
    onClose?: () => void
    children?: React.ReactNode,
}

export default function StylishDialog({ open, onClose, children }: StylishDialogProps) {
    const mainRef = React.useRef<HTMLDivElement>(null);
    const dialogRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (open) {
            mainRef.current?.classList.remove("hidden");
            mainRef.current?.classList.add("flex");
            setTimeout(() => {
                mainRef.current?.classList.remove("opacity-0");
                mainRef.current?.classList.add("opacity-100");
                dialogRef.current?.classList.add("scale-100");
            }, 10);
        } else {
            mainRef.current?.classList.remove("opacity-100");
            mainRef.current?.classList.add("opacity-0");
            setTimeout(() => {
                mainRef.current?.classList.add("hidden");
                mainRef.current?.classList.remove("flex");
                dialogRef.current?.classList.remove("scale-100");
            }, 500);
        }}, [open]);

    return (
    <div className={`fixed inset-0 top-[40px] z-2 items-center justify-center transition duration-500 hidden opacity-0`} ref={mainRef}>
        <div className={`absolute inset-0 bg-black opacity-30`} onClick={onClose}></div>
        <div className='rounded-[12px] z-4 p-4 transition duration-500 scale-75 max-w-3/4 min-w-[20%] lg:max-w-2/4' role="dialog" ref={dialogRef}
        style={{backgroundColor: "rgb(var(--md-sys-color-surface-variant))", color: "rgb(var(--md-sys-color-on-surface-variant))"}}>
            {children}
        </div>
    </div>
    )
}
