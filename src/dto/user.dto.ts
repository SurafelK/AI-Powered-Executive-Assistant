export interface ICreateUserInput {
    name:string,
    password:string,
    email:string
}

export interface ILoginInput {
    password:string,
    email:string
}