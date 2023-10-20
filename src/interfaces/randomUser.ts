export interface RandomUser {
    login: {
        uuid: string
    }
    name: {
        first: string
        last: string
    }
    location: {
        street: {
            name: string
        }
        city: string
        country: string
    }
    phone: string
}
