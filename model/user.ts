import { model, Document, Schema } from "mongoose";

interface IUser extends Document {
    name: string;
    password: string;
    salt: string;
    email: string;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, minlength: 3, maxlength: 20 },
        password: { type: String, required: true, minlength: 3 },
        salt: { type: String, required: true, minlength: 3 },
        email: { type: String, required: true, minlength: 3, maxlength: 40, unique: true },
    },
    {
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.password;
                delete ret.salt;
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret._id;
                return ret;
            },
        },
        timestamps:true
    }
);

const UserModel = model<IUser>("User", UserSchema);

export { UserModel };
