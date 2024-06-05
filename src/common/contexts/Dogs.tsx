import IDog from "common/interfaces/IDog";
import { useState, useContext, createContext, useEffect } from "react";
import Database from "tauri-plugin-sql-api";

const db = await Database.load("sqlite:data.db");
await db.execute(`CREATE TABLE IF NOT EXISTS dogs (
    id VARCHAR(500) PRIMARY KEY, name TEXT,
    ownerId VARCHAR(500), ownerName TEXT,
    breed VARCHAR(100), gender VARCHAR(20), isFromAClub BOOLEAN,
    number VARCHAR(30), adress TEXT, birthDay TEXT,
    clubCost NUMERIC, shelved BOOLEAN
);`);

interface ContextProps {
    dogs?: IDog[] | null,
    setDogs: React.Dispatch<React.SetStateAction<IDog[] | null>>,
    loaded: boolean,
    setLoaded: React.Dispatch<React.SetStateAction<boolean>>
}

export const DogsContext = createContext<ContextProps>({setDogs: () => null, loaded: false, setLoaded: () => null});
DogsContext.displayName = "Dogs";

export function DogsContextProvider({ children }: {children: React.ReactElement[]}) {
    const [dogs, setDogs] = useState<IDog[] | null>([]);
    const [loaded, setLoaded] = useState(false);

    return (
        <DogsContext.Provider value={{dogs, setDogs, loaded, setLoaded}}>
            {children}
        </DogsContext.Provider>
    )
}

export function useDogsContext() {
    const { dogs, setDogs, loaded, setLoaded } = useContext(DogsContext);
    useEffect(() => {
        if (!dogs?.length && !loaded) setLoadedFiles();
    })

    // useEffect(() => {
    //     console.log("effect")
    //     //if (loaded) setDogs(() => null);
    // }, [setDogs, loaded])

    async function setLoadedFiles() {
        try {
            setLoaded(true);
            let dgs: IDog[] = await db.select("SELECT * FROM dogs");
            dgs = dgs.map(dog => {
                let newDog = dog;
                newDog.isFromAClub = (typeof(dog.isFromAClub) === "number" && dog.isFromAClub === 1) ? true : false;
                return newDog;
            })

            setDogs(dgs);
        } catch (e) {
            
        }
    }

    async function addDog(newDog: IDog) {
        const a = await db.execute(`INSERT INTO dogs (
            id, name, ownerId, ownerName, breed, gender,
            isFromAClub, number, adress, birthDay, clubCost, shelved
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        );`, [newDog.id, newDog.name, newDog.ownerId, newDog.ownerName,
        newDog.breed, newDog.gender, newDog.isFromAClub ? 1 : 0, newDog.number,
        newDog.adress, newDog.birthDay, newDog.clubCost, newDog.shelved]);

        console.log(a);
        const theDog: IDog[] = await db.select("SELECT * FROM dogs WHERE id = $1", [newDog.id]);
        theDog[0].isFromAClub = (typeof(theDog[0].isFromAClub) === "number" && theDog[0].isFromAClub === 1) ? true : false;
        setDogs(previousDogs => previousDogs ? [...previousDogs, ...theDog] : theDog);
    }

    async function updateDog(dogObject: IDog) {
        await db.execute(`UPDATE dogs
        SET id = $1, name = $2, ownerId = $3, ownerName = $4, breed = $5, gender = $6,
        isFromAClub = $7, number = $8, adress = $9, birthDay = $10, clubCost = $11, shelved = $12
        WHERE id = $13`,
        [dogObject.id, dogObject.name, dogObject.ownerId, dogObject.ownerName, dogObject.breed,
        dogObject.gender, dogObject.isFromAClub, dogObject.number, dogObject.adress, dogObject.birthDay,
        dogObject.clubCost, dogObject.shelved, dogObject.id]);
        const newDogs: IDog[] = await db.select("SELECT * FROM dogs");
        setDogs(newDogs);
    }

    async function removeDog(dogId: string) {
        setDogs(previousDogs => previousDogs ? previousDogs.filter(dog => dog.id !== dogId) : null);
        await db.execute("DELETE FROM dogs WHERE id = $1", [dogId]);
    }

    return {dogs, addDog, updateDog, removeDog}
}