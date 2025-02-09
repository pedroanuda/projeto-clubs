import { invoke } from "@tauri-apps/api/core";
import IOwner from "common/interfaces/IOwner";

/**
 * Fetches the information from the dog's owners.
 * 
 * @param dogId The dog Id.
 * @param onlyIdAndName If true, it returns an array with objects containing only the id and name of the owners.
 * 
 * @returns `IOwner[]` or `{id, name}[]`
 */
export async function getOwnersFromDog(dogId: string, onlyIdAndName: boolean = false) {
    try {
        type Simple = {id: String, name: string};

        const raw: string = await invoke("get_owners_from_dog", {dogId});
        const untyped = JSON.parse(raw);
        if (onlyIdAndName) {
            return untyped.reduce((acc: Array<Simple>, item: any) => {
                acc.push({id: item.id, name: item.name});
                return acc;
            }, [])
        }

        let result: IOwner[] = untyped.map((owner: any) => {
            if (owner.phone_numbers !== "")
                owner.phone_numbers = convertNumbers(owner.phone_numbers);
    
            owner.register_date = owner.register_date !== "" 
            ? new Date(owner.register_date)
            : null;

            return owner;
        });
        

        return result;

    } catch (e) {
        console.error("Error fetching owners from dog: ", e);
        throw e;
    }
}

/**
 * **(Probably going to be deprecated in the future)**
 * 
 * Converts the owner's numbers from one way to another and vice-versa. 
 * 
 * Basically, numbers can be separated like
 * "Casa:123456789|Celular:3542789" in a string. And this function provides a way to
 * convert it into an object or converting it from an object to a string.
 * 
 * @param numbers Objects or string containing numbers and labels for them.
 */
export function convertNumbers(numbers: {label?: string, value: string}[] | string) {
    let nArray: string[] = []
    if (typeof numbers == "string") {
        nArray = numbers.split("|");
        let objects: {label?: string, value: string}[] = nArray.map(n => {
            let a = n.split(":");
            if (a.length > 1) return {label: a[0], value: a[1]};
            
            return {value: a[0]}
        })
        return objects;
    } else if (typeof numbers == "object") {
        numbers.forEach(number => nArray.push(`${number.label ?? ""}:${number.value}`));
        return nArray.join("|");
    }
}
