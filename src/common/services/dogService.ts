import IPet from 'common/interfaces/IPet';
import { getOwners } from './ownerService';
import api from 'common/api';

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
 * @returns A promise of an {@link IPet} array.
 */
export async function getAllDogs(
  shelved?: boolean,
  page: number = 0,
  fromOwnerId?: string,
  searchInput?: string | null,
  status?: string | null
) {
  const breeds = await getBreeds();
  try {
    const pageConfig = {
      limit: page <= 0 ? null : dogsPerPage,
      offset: page <= 1 ? null : dogsPerPage * (page - 1),
    };

    const resolvedStatus =
      status !== undefined
        ? status
        : shelved === true
          ? 'archived'
          : shelved === false
            ? 'active'
            : null;

    const dogs =
      (fromOwnerId
        ? await api.call<IPet[]>('Pet', 'ListByOwner', { owner_id: fromOwnerId })
        : await api.list<IPet[]>('Pet', {
            search: searchInput,
            status: resolvedStatus === 'all' ? null : resolvedStatus,
            ...pageConfig,
          })) ?? [];

    return await Promise.all(
      dogs.map(async (dog) => {
        dog.owners = await getOwners({ fromDogId: dog.id || '', onlyIdAndName: true });
        dog.breed_name = breeds.find((breed) => breed.id === dog.breed_id)?.name || 'N/A';
        return dog;
      })
    );
  } catch (e) {
    console.error('Error fetching all dogs: ', e);
    throw e;
  }
}

/**
 * This function takes a new dog object and adds it into the database
 * via the backend.
 *
 * @param newDog The dog to be added.
 */
export async function addDog(newDog: IPet) {
  const { owners, ...converted } = newDog;
  const ids = owners?.reduce((acc: String[], owner) => {
    acc.push(owner.id);
    return acc;
  }, []);

  try {
    await api.create('Pet', { ...converted, owners_ids: ids });
  } catch (e) {
    console.log('Error creating dog: ', e);
    throw e;
  }
}

/**
 * Fetches a single dog by its ID along with its owners and breed details.
 *
 * @param id The ID of the dog to fetch.
 */
export async function getDog(id: string) {
  const breeds = await getBreeds();
  try {
    const dog = await api.getById<IPet>('Pet', id);
    if (dog) {
      dog.owners = await getOwners({ fromDogId: dog.id || '', onlyIdAndName: true });
      dog.breed_name = breeds.find((breed) => breed.id === dog.breed_id)?.name || 'N/A';
    }
    return dog;
  } catch (e) {
    console.error('Error fetching dog by id: ', e);
    throw e;
  }
}

/**
 * Updates an existing dog in the database via the backend.
 *
 * @param dog The dog object with updated properties.
 */
export async function updateDog(dog: IPet) {
  const { owners, ...converted } = dog;
  const ids = owners?.reduce((acc: string[], owner) => {
    acc.push(owner.id);
    return acc;
  }, []);

  try {
    await api.update('Pet', { ...converted, owners_ids: ids });
  } catch (e) {
    console.error('Error updating dog: ', e);
    throw e;
  }
}

/**
 * Deletes a dog from the database by its ID.
 *
 * @param id The ID of the dog to delete.
 */
export async function deleteDog(id: string) {
  try {
    await api.deleteById('Pet', id);
  } catch (e) {
    console.error('Error deleting dog: ', e);
    throw e;
  }
}

/** It gets all the breeds straight from the database. */
export async function getBreeds() {
  try {
    type Breed = {
      id: number;
      name: string;
      description: string;
      picture_path: string;
    };

    return (await api.list<Breed[]>('Breed')) ?? [];
  } catch (e) {
    throw Error('Error getting breeds: ' + e);
  }
}
