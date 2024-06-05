import React, { CSSProperties } from 'react';
import { PatternFormat } from 'react-number-format';
import styles from "./DetailsField.module.css";
import { Select } from '@mui/material';

interface DetailsFieldProps {
    /** Will be used to be written as a label etc. */
    name: string,
    value: string | number | undefined,
    valueSetter?: React.Dispatch<React.SetStateAction<string | number | undefined>>,
    /** Which kind of field it will be. @default "text" */
    type?: 'text' | 'select' | 'age' | 'cel',
    /** The text that appears in the field when it's empty and not in {@link viewOnly} mode. */
    placeholder?: string,
    children?: any,
    /** Determines if the field can be changed or not. @default false */
    viewOnly?: boolean,
    /** If true, makes the field obligatory when in a form. @default false */
    required?: boolean,
    /** What will appear in {@link viewOnly} mode if the {@link value} is not applicable. */
    whenNothingDisplay?: string,
    /** It's similar to {@link whenNothingDisplay}, but it appears always when in viewOnly mode. */
    viewOnlyDisplay?: string,
    /** Styles applied to the whole field when it's in {@link viewOnly} mode. */
    style?: CSSProperties,
    /** Styles applied to the whole field when it's NOT in {@link viewOnly} mode. */
    editStyle?: CSSProperties
}

export default function DetailsField({ name, value, placeholder, valueSetter, style, editStyle, whenNothingDisplay, children, type = 'text', viewOnly = false, required = false, viewOnlyDisplay }: DetailsFieldProps) {
    const getInput = (wType: 'text' | 'age' | 'cel') => {
        if (wType === 'text') return <input autoComplete="none" onChange={e => valueSetter && valueSetter(e.target.value)} id={name} type={wType} value={value} placeholder={placeholder} required={required} />
        else if (wType === 'age') return <input autoComplete="none" onChange={e => valueSetter && valueSetter(e.target.value)} id={name} type="number" value={value} placeholder={placeholder} min={0} max={50} required={required} />
        else if (wType === 'cel') return <PatternFormat autoComplete="none" onChange={e => valueSetter && valueSetter(e.target.value)} id={name} value={value} placeholder={placeholder} required={required} format="(##) #####-####" />
    }

    return (
    <div style={viewOnly ? style : editStyle} className={styles.field}>
        <label htmlFor={name}>{name}</label>
        {viewOnly
        ? <p>{viewOnlyDisplay ? viewOnlyDisplay : (value && value !== "") ? value : whenNothingDisplay}</p>
        : type !== "select"
        ? getInput(type)
        : <Select value={value} onChange={e => valueSetter && valueSetter(e.target.value)} defaultValue={""} style={{minWidth: "100px"}} MenuProps={{style: {maxHeight: "280px"}}}>{children}</Select>}
    </div>
    )
}
