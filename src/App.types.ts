export interface Login {
    uuid: string;
}

export interface Name {
    first: string;
    last: string;
}

export interface Users {
    login: Login;
    name: Name;
    email: string;
}