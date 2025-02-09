export default interface IOwner {
    id: string,
    name: string,
    adresses?: string,
    email?: string,
    phone_numbers?: { value: string, label?: string }[],
    about?: string,
    register_date?: Date
}