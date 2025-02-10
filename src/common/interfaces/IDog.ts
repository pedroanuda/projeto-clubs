export default interface IDog {
    id: string,
    name: string,
    breed_id: number,
    breed_name: string,
    gender: 'male' | 'female' | string,
    owners?: {id: string, name: string}[]
    shelved?: boolean,
    picture_path?: string | null,
    birthday?: string | null,
    notes?: string | null,
    default_pack_price?: Number | null
}