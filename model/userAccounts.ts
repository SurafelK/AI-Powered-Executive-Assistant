import mongoose, { model, Document, Schema } from "mongoose";

interface IUserAccount extends Document {
    email: string;
    password: string;
    provider: string;
    userId: mongoose.Types.ObjectId; // Reference to User
    respondAllEmail: boolean;
    hostname:string
}

const UserAccountSchema = new Schema<IUserAccount>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to UserModel
    respondAllEmail: { type: Boolean, default: false },
    hostname: {type:String, required:true}
});

const UserAccountModel = model<IUserAccount>("UserAccount", UserAccountSchema);

export { UserAccountModel };
