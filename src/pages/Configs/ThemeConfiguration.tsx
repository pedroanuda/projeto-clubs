import { FocusRing, useFocusRing } from "actify";
import clsx from "clsx";
import { useConfiguration } from "common/contexts/ConfigurationContext";

type ThemeButtonProps = {
    theme: { label: string, primaryColor: string, surfaceColor: string },
    selected: boolean,
    onPress: () => void
}

function ThemeButton(props: ThemeButtonProps) {
    const { theme, selected, onPress } = props;
    const { isFocused, focusProps } = useFocusRing();

    return (
        <span className="relative h-9 rounded-full">
            <button {...focusProps}
                onClick={onPress}
                style={{'--primary': theme.primaryColor, '--surface': theme.surfaceColor} as React.CSSProperties}
                className={clsx(`
                    size-9
                    cursor-pointer
                    bg-[linear-gradient(135deg,var(--primary)_50%,var(--surface)_50%)]
                    rounded-full
                    border-2
                    shadow
                `, selected ? 'border-secondary' : 'border-surface-variant hover:border-surface-dim')}
                aria-label={`Escolher tema ${theme.label}`}
            />
            {isFocused && <FocusRing />}
        </span>
    )
}

export default function ThemeConfiguration() {
    const { theme: selectedTheme, setTheme } = useConfiguration();

    const themeOptions = [
        { label: 'Azul', primaryColor: '#006874', surfaceColor: '#e1f0f2' },
        { label: 'Rosa', primaryColor: '#a513a7', surfaceColor: '#fff7f9'}
    ];

    return (
        <div>
            <h4 className="text-secondary font-semibold">Tema</h4>
            <p className="text-sm">Escolha o tema do sistema</p>
            <div className="flex items-center gap-2 mt-2">
                {themeOptions.map((theme) => (
                    <ThemeButton
                        key={theme.label}
                        theme={theme}
                        selected={theme.label === selectedTheme}
                        onPress={() => setTheme(theme.label)}
                    />
                ))}
            </div>
        </div>
    )
}