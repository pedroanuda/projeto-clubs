export default interface IDog {
    id: string,
    name: string,
    ownerId: string,
    ownerName: string,
    breed: string,
    gender: 'male' | 'female' | string,
    isFromAClub: boolean,
    imagePath?: string,
    number?: string,
    adress?: string,
    birthDay?: string,
    clubCost?: number,
    shelved?: boolean,
    notes?: Object
}