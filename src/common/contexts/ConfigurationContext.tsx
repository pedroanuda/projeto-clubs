import React from 'react';
import { getConfigurations, saveConfiguration } from 'common/services/configurationService';

export interface ConfigurationContextValue {
    configurations: Record<string, string>;
    loading: boolean;
    theme: string;
    setConfiguration: (name: string, value: string) => Promise<void>;
    setTheme: (themeName: string) => Promise<void>;
    getConfiguration: (name: string, defaultValue?: string) => string;
}

const ConfigurationContext = React.createContext<ConfigurationContextValue | undefined>(undefined);

/**
 * Applies the CSS theme class to the root element.
 */
export const applyTheme = (themeName: string) => {
    const root = document.documentElement;
    if (themeName === 'Rosa') {
        root.classList.add('pink');
    } else {
        root.classList.remove('pink');
    }
};

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [configurations, setConfigurations] = React.useState<Record<string, string>>({});
    const [theme, setThemeState] = React.useState<string>('Azul');
    const [loading, setLoading] = React.useState<boolean>(true);

    const loadConfigurations = React.useCallback(async () => {
        try {
            setLoading(true);
            const list = await getConfigurations();
            const configMap: Record<string, string> = {};
            list.forEach(item => {
                configMap[item.name] = item.value;
            });
            setConfigurations(configMap);

            const activeTheme = configMap['theme'] || 'Azul';
            setThemeState(activeTheme);
            applyTheme(activeTheme);
        } catch (e) {
            console.error("Error loading configurations in provider:", e);
            applyTheme('Azul');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadConfigurations();
    }, [loadConfigurations]);

    const setConfiguration = React.useCallback(async (name: string, value: string) => {
        setConfigurations(prev => ({ ...prev, [name]: value }));
        if (name === 'theme') {
            setThemeState(value);
            applyTheme(value);
        }
        await saveConfiguration(name, value);
    }, []);

    const setTheme = React.useCallback(async (themeName: string) => {
        await setConfiguration('theme', themeName);
    }, [setConfiguration]);

    const getConfiguration = React.useCallback((name: string, defaultValue = '') => {
        return configurations[name] ?? defaultValue;
    }, [configurations]);

    return (
        <ConfigurationContext.Provider value={{
            configurations,
            loading,
            theme,
            setConfiguration,
            setTheme,
            getConfiguration
        }}>
            {children}
        </ConfigurationContext.Provider>
    );
};

export const useConfiguration = (): ConfigurationContextValue => {
    const context = React.useContext(ConfigurationContext);
    if (!context) {
        throw new Error('useConfiguration must be used within a ConfigurationProvider');
    }
    return context;
};

export default ConfigurationContext;
