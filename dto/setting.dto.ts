export interface IUserSettingInput {
    email: string;
    password: string;
    provider: string;
    respondAllEmail?: boolean; // Optional if not always provided
}
