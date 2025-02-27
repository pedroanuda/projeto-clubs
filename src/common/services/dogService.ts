import { invoke } from "@tauri-apps/api/core";
import IDog from "common/interfaces/IDog";
import { getOwners } from "./ownerService";

/** The max amount of registers per page. */
const dogsPerPage = 50;

/**
 * An async function that will fetch all the dogs registered in the database,
 * or all that matches with search input.
 * 
 * @param shelved 
 * If true, it gets only archived dogs. Otherwise, it gets all dogs that are not archived.
 * 
 * @param page 
 * The page number, useful for navigating within a limit of items per page. 
 * Check: {@link dogsPerPage}.
 * 
 * @param fromOwnerId
 * The owner's id you want to get dogs from.<br>
 * **Observation:** If defined, then all the others parameters won't make any difference.
 * 
 * @param searchInput
 * If defined, the input will be used to get all dogs with their names, or their owners'
 * names like it. <br />
 * **Observation:** If it's defined, then the {@link shelved} parameter won't make any difference.
 * 
 * @returns A promise of an {@link IDog} array.
 */
export async function getAllDogs(shelved: boolean, page: number = 0, fromOwnerId?: string, searchInput?: string | null) {
    try {
        const pageConfig = {
            limit: page <= 0 ? null : dogsPerPage, 
            offset: page <= 1 ? null : dogsPerPage * (page - 1)
        };

        const dogs_raw: string = fromOwnerId
        ? await invoke('get_dogs_from_owner', {
            ownerId: fromOwnerId
        })
        : searchInput
        ? await invoke('search_for', {
            input: searchInput,
            searchType: "Dogs",
            ...pageConfig
        })
        : await invoke('get_dogs', {
            shelved,
            ...pageConfig  
        });

        const dogs: IDog[] = JSON.parse(dogs_raw);
        return await Promise.all(dogs.map(async dog => {
            dog.owners = await getOwners(undefined, dog.id, true);
            return dog;
        }));
        
    } catch (e) {
        console.error("Error fetching all dogs: ", e);
        throw e;
    }
}

/**
 * This function takes a new dog object and adds it into the database
 * via the backend.
 * 
 * @param newDog The dog to be added.
 */
export async function addDog(newDog: IDog) {
    const {owners, ...converted} = newDog;
    const ids = owners?.reduce((acc: String[], owner) => {
        acc.push(owner.id);
        return acc;
    }, [])

    try {
        await invoke("create_dog", {newDog: converted, ownersIds: ids});
    } catch (e) {
        console.log("Error creating dog: ", e);
        throw e;
    }
}

/** It gets all the breeds straight from the database. */
export async function getBreeds() {
    try {
        type Breed = {
            id: number,
            name: string, 
            description: string, 
            picture_path: string
        };

        let raw: string = await invoke("get_breeds");
        return JSON.parse(raw) as Breed[];
    } catch (e) {
        throw Error("Error getting breeds: " + e);
    }
}
