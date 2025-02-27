import { FocusRing, Icon, Ripple, useFocusRing } from "actify";
import React from "react";

interface SearchBarProps {
    placeholder?: string;
    value?: string | null;
    className?: string;
    style?: React.CSSProperties;
    searchTimeout?: number;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

function debounce(func: () => void, timeout = 300) {
    let timer: NodeJS.Timeout;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(func, timeout);
    }
}

export default function SearchBar({ placeholder, value, onChange, onSubmit, ...props }: SearchBarProps) {
    const { isFocusVisible, isFocused, focusProps } = useFocusRing();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const formRef = React.useRef<HTMLFormElement>(null);


    const debouncedSubmit = React.useCallback(debounce(() => {
        formRef.current?.requestSubmit();
    }, props.searchTimeout), [formRef]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e);
        }
        debouncedSubmit();
    }

    return (
      <form action={""} {...props} 
      onSubmit={onSubmit} ref={formRef}>
            <div className="rounded-[18px] relative cursor-text"
            style={{backgroundColor: "rgb(var(--md-sys-color-surface-variant))", color: "rgb(var(--md-sys-color-on-surface-variant))"}}>
                <div className="absolute flex items-center h-full top-0 ml-[.5rem] outline-0">
                    <Icon>
                        Search
                    </Icon>
                </div>
                <input placeholder={placeholder} type="search" className={`w-full h-full outline-0 pr-[.8rem] py-2 rounded-[18px]`} 
                style={{paddingLeft: "calc(24px + 1rem)"}}
                value={value ?? ""} onChange={handleChange} ref={inputRef} {...focusProps}></input>
                {/* <Button className={styles.searchButton} 
                variant="contained" sx={{borderRadius: "20px", position: "absolute"}}
                type="submit" disableElevation
                startIcon={<SearchIcon />}>Buscar</Button> */}
                {isFocusVisible && <FocusRing />}
            </div>
      </form>
    )
}
