export default interface IOwner {
    id: string,
    name: string,
    register_date?: Date
    phone_numbers?: { value: string, label?: string }[],
    email?: string | null,
    addresses?: string[] | null,
    about?: string | null,
}