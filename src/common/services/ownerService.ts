import { invoke } from "@tauri-apps/api/core";
import IOwner from "common/interfaces/IOwner";

const ownersPerPage = 50;

/**
 * Fetches the information from owners.
 * 
 * @param fromDogId The dog id. If defined, it gets the owners of this specific dog.
 * @param onlyIdAndName If true, it returns an array with objects containing only the id and name of the owners.
 * 
 * @returns `IOwner[]` or `{id, name}[]`
 */
export async function getOwners(page?: number, fromDogId?: string, onlyIdAndName: boolean = false) {
    try {
        type Simple = {id: String, name: string};
        const pagingConfig = {
            limit: page !== undefined ? ownersPerPage : null,
            offset: page !== undefined && page > 1 ? ownersPerPage * (page - 1) : null
        };

        const raw: string = fromDogId !== undefined 
        ? await invoke("get_owners_from_dog", {dogId: fromDogId})
        : await invoke("get_all_owners", pagingConfig);
        const untyped = JSON.parse(raw);
        if (onlyIdAndName) {
            return untyped.reduce((acc: Array<Simple>, item: any) => {
                acc.push({id: item.id, name: item.name});
                return acc;
            }, [])
        }

        let result: IOwner[] = untyped.map((owner: any) => convertToIOwner(owner));
        

        return result;

    } catch (e) {
        console.error("Error fetching owners: ", e);
        throw e;
    }
}

/**
 * It takes a new {@link IOwner} object and uses the {@link convertToBackObject}
 * function to add the owner into the database.
 * 
 * @param newOwner The owner that is going to be added.
 */
export async function addOwner(newOwner: IOwner) {
    try {
        await invoke("create_owner", {newOwner: convertToBackObject(newOwner)});
    } catch (e) {
        throw Error("Error adding owner: " + e);
    }
}

/**
 * Gets an owner object with the specified id, coming from the database,
 * and returns it as a {@link IOwner}
 * 
 * @param id The owner id.
 */
export async function getOwner(id: string) {
    try {
        const untyped = JSON.parse(await invoke("get_owner", {id}));
        return convertToIOwner(untyped);
    } catch (e) {
        throw Error("Error on reading owner: " + e);
    }
}

/**
 * Gets a modified owner object and updates the info about them in the
 * database.
 * 
 * Observation: if modified, the register date won't be saved.
 * 
 * @param owner The modified {@link IOwner} object.
 */
export async function saveOwner(owner: IOwner) {
    try {
        let obj = convertToBackObject(owner);
        await invoke("update_owner", { newOwner: obj });
    } catch (e) {
        throw Error("Error on saving owner: " + e);
    }
}

/**
 * Takes a typed IOwner object and converts it to something
 * compatible with the backend command.
 * 
 * It does what it does by straightening the phone numbers into a string
 * and the register date into a string too.
 * 
 * @param ownerObject The typed object to be converted.
 */
function convertToBackObject(ownerObject: IOwner) {
    let untyped: any = {...ownerObject};

    untyped.phone_numbers = ownerObject.phone_numbers
    ? convertNumbers(ownerObject.phone_numbers)
    : null;

    untyped.addresses = ownerObject.addresses
    ? ownerObject.addresses.join("|")
    : null;

    untyped.register_date = ownerObject.register_date
    ? `${ownerObject.register_date.getFullYear()}-${ownerObject.register_date.getMonth()}-${ownerObject.register_date.getDate()}`
    : "";
    
    return untyped;
}

/**
 * Takes an untyped object coming from the backend and converts it
 * to an {@link IOwner}.
 * 
 * Basically, it grabs the inline separated phone numbers and converts
 * those to a more legible object. Also, it grabs the register date coming
 * from the database and converts it to a {@link Date} type.
 * 
 * @param untypedObj The object to be converted.
 */
function convertToIOwner(untypedObj: any): IOwner {
    if (untypedObj.phone_numbers !== "")
        untypedObj.phone_numbers = convertNumbers(untypedObj.phone_numbers);
    
    untypedObj.register_date = untypedObj.register_date !== "" 
    ? new Date(untypedObj.register_date)
    : null;

    untypedObj.addresses = untypedObj.addresses == ""
    ? null 
    : untypedObj.addresses?.split("|");
    
    return untypedObj as IOwner;
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
    if (!numbers) return numbers;

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
