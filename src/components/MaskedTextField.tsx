import { useIMask } from 'react-imask';
import { TextField } from 'actify';
import React from 'react';

interface MaskedTextFieldProps {
    name?: string;
    value?: string;
    mask?: any;
    variant?: 'outlined' | 'filled'
    label?: string;
    placeholder?: string;
    autoComplete?: string;
    type?: 'text' | 'tel' | 'email';
    ref?: React.RefObject<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: (e: FocusEvent) => void;
}

/** A mask variant of Actify's TextField that works with IMask. */
function MaskedTextField({
  value: externalValue,
  mask,
  label,
  variant = 'filled',
  type = 'text',
  ref: _ref,
  onChange,
  onBlur,
  placeholder,
  ...others
}: MaskedTextFieldProps) {
  const [internalValue, setInternalValue] = React.useState(externalValue || "");

  const { ref, value: maskedValue, setValue: setMaskedValue } = useIMask({
    mask: mask,
    overwrite: true,
  }, {
    onAccept: (value: string) => {
      setMaskedValue(value);
      setInternalValue(value);
      if ((value !== externalValue) && onChange) {
        onChange({target: {value: value, name: others.name ?? ""}} as React.ChangeEvent<HTMLInputElement>)
      }
    },
    defaultValue: internalValue,
    ref: _ref
  });

  React.useEffect(() => {
    const inRef = (ref as React.RefObject<HTMLInputElement>).current;
    if (onBlur) {
      inRef?.addEventListener("blur", onBlur);
      return () => inRef?.removeEventListener("blur", onBlur);
    }
  }, [onBlur])

  React.useEffect(() => {
    if (externalValue !== maskedValue && externalValue !== undefined) {
      setMaskedValue(externalValue);
      setInternalValue(externalValue);
    }
  }, [externalValue, maskedValue])

  return (
    <TextField
      {...others}
      type={type}
      variant={variant}
      value={internalValue}
      ref={ref as React.RefObject<HTMLInputElement>}
      label={label}
      placeholder={placeholder}
    />
  );
}

export default React.memo(MaskedTextField);
