import api from "common/api";

export interface IConfiguration {
    name: string;
    value: string;
}

/**
 * Fetches all configurations from the backend.
 */
export async function getConfigurations(): Promise<IConfiguration[]> {
    try {
        const result = await api.list<IConfiguration[]>('Configuration');
        return result || [];
    } catch (e) {
        console.error("Error fetching configurations:", e);
        return [];
    }
}

/**
 * Saves or updates a configuration entry in the backend.
 * 
 * @param name Configuration key name (e.g. 'theme')
 * @param value Configuration value (e.g. 'Rosa')
 */
export async function saveConfiguration(name: string, value: string): Promise<void> {
    try {
        await api.call('Configuration', 'Save', { name, value });
    } catch (e) {
        console.error(`Error saving configuration '${name}':`, e);
        throw e;
    }
}
