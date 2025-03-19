export interface IUserSettingInput {
    email: string;
    password: string;
    provider: string;
    respondAllEmail?: boolean; // Optional if not always provided
}

export interface IgetAccountEmails {
    email:string
}

export interface SuggestionRequest {
    idea: string;
    from: string;
    body: string;
    subject: string;
}