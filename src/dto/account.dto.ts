export interface IUserSettingInput {
    email: string;
    password: string;
    provider: string;
    respondAllEmail?: boolean; // Optional if not always provided
    preferenceResponse?: string
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
export interface sendEmailInput {
    to: string;
    body: string;
    email: string;
}