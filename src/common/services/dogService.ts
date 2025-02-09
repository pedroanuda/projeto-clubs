import { invoke } from "@tauri-apps/api/core";
import IDog from "common/interfaces/IDog";
import { getOwnersFromDog } from "./ownerService";

/** The max amount of registers per page. */
const dogsPerPage = 50;

/**
 * An async function that will fetch all the dogs registered in the database.
 * 
 * @param shelved If true, it gets only archived dogs. Otherwise, it gets all dogs that are not archived.
 * @param page The page number, useful for navigating within a limit of items per page. Check: {@link dogsPerPage}.
 * @returns A promise of an {@link IDog} array.
 */
export async function getAllDogs(shelved: boolean, page: number = 0) {
    try {
        const dogs_raw: string = await invoke('get_dogs', {
            shelved,
            limit: page <= 0 ? null : dogsPerPage, 
            offset: page <= 1 ? null : dogsPerPage * (page - 1)
        });
        const dogs: IDog[] = JSON.parse(dogs_raw);
        return await Promise.all(dogs.map(async dog => {
            dog.owners = await getOwnersFromDog(dog.id, true);
            return dog;
        }));
        
    } catch (e) {
        console.error("Error fetching all dogs: ", e);
        throw e;
    }
}

