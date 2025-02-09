export default interface IDog {
    id: string,
    name: string,
    breed_id: number,
    breed_name: string,
    gender: 'male' | 'female' | string,
    owners?: {id: String, name: string}[]
    picture_path?: string,
    birthDay?: string,
    shelved?: boolean,
    notes?: String,
    default_pack_price?: Number
}