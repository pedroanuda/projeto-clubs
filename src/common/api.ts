import { invoke } from "@tauri-apps/api/core";

export type ApiEntity = 'Pet' | 'Owner' | 'Breed' | 'Configuration';

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error_message?: string | null;
};

/**
 * A function to create a new entity/resource in backend.
 * @param entity The entity in backend.
 * @param data The data necessary to creation of the entity.
 * @returns Generally nothing.
 */
async function create<T = void>(entity: ApiEntity, data: object): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action: 'Create',
                params: data,
            },
        },
    });

    if (!response.success)
        throw Error("Error creating entity: " + response.error_message);

    return response.data as T;
};

/**
 * A function to update an entity/resource in backend.
 * @param entity The entity in backend.
 * @param data The data necessary to update the entity.
 * @returns Generally nothing.
 */
async function update<T = void>(entity: ApiEntity, data: object): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action: 'Update',
                params: data,
            },
        },
    });

    if (!response.success)
        throw Error("Error updating entity: " + response.error_message);

    return response.data as T;
};

/**
 * A function to get an entity/resource by its id from backend.
 * @param entity The entity in backend;
 * @param id The entity's id
 * @returns Generally a raw JSON of the entity to be converted
 */
async function getById<T = string>(entity: ApiEntity, id: string | number): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action: 'Get',
                params: { id },
            },
        },
    });

    if (!response.success)
        throw Error("Error getting entity by id: " + response.error_message);

    return response.data as T;
};

/**
 * A function to list entities/resources from backend.
 * @param entity The entity in backend.
 * @param params Parameters used in the action
 * @returns Generally a raw JSON array to be coverted.
 */
async function list<T = string>(entity: ApiEntity, params?: object): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action: 'List',
                params: params || {},
            },
        },
    });

    if (!response.success)
        throw Error("Error listing entities: " + response.error_message);

    return response.data as T;
};

/**
 * A function to delete an entity/resource by its id in the backend.
 * @param entity The entity in backend.
 * @param id The id of the entity that's being deleted.
 * @returns Generally nothing.
 */
async function deleteById<T = void>(entity: ApiEntity, id: string | number): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action: 'Delete',
                params: { id },
            },
        },
    });

    if (!response.success)
        throw Error("Error deleting entity by id: " + response.error_message);
    
    return response.data as T;
}

/**
 * A function to call any action from backend.
 * @param entity The entity in backend.
 * @param action The action being made in backend.
 * @param params Parameters used in the action.
 * @returns It depends on the action, so it's unknown.
 */
async function call<T = unknown>(entity: ApiEntity, action: string, params?: object): Promise<T> {
    const response: ApiResponse<T> = await invoke('backend_dispatcher', {
        payload: {
            type: entity,
            data: {
                action,
                params: params || {},
            },
        },
    });

    if (!response.success)
        throw Error("Error calling backend action: " + response.error_message);

    return response.data as T;
};

/**
 * The api object that exposes all the functions to communicate easily with backend.
 */
const api = { create, update, getById, list, call, deleteById };
export default api;
