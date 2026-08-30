import React from 'react';
import StylishSnack from 'components/StylishSnack';

export type SnackbarVariation = 'neutral' | 'success' | 'error';
export type SnackbarPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface SnackbarOptions {
    position?: SnackbarPosition;
    closeByItself?: boolean;
}

export interface SnackbarContextValue {
    openSnackbar: (text: string, variation?: SnackbarVariation, options?: SnackbarOptions) => void;
    closeSnackbar: () => void;
}

const SnackbarContext = React.createContext<SnackbarContextValue | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = React.useState(false);
    const [text, setText] = React.useState('');
    const [variation, setVariation] = React.useState<SnackbarVariation>('neutral');
    const [position, setPosition] = React.useState<SnackbarPosition>('bottom-right');
    const [closeByItself, setCloseByItself] = React.useState(true);

    const openSnackbar = React.useCallback((
        messageText: string,
        messageVariation: SnackbarVariation = 'neutral',
        options?: SnackbarOptions
    ) => {
        setText(messageText);
        setVariation(messageVariation);
        setPosition(options?.position ?? 'bottom-right');
        setCloseByItself(options?.closeByItself ?? true);
        setOpen(true);
    }, []);

    const closeSnackbar = React.useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
            {children}
            <StylishSnack
                open={open}
                text={text}
                variation={variation}
                position={position}
                closeByItself={closeByItself}
                onClose={closeSnackbar}
            />
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = (): SnackbarContextValue => {
    const context = React.useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

export default SnackbarContext;
