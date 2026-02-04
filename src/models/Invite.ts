import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvite extends Document {
    email: string;
    role: string;
    team?: string;
    department?: string;
    status: 'pending' | 'accepted' | 'revoked';
    invitedBy?: string; // Information about who sent the invite
    token: string;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InviteSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
        },
        team: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'revoked'],
            default: 'pending',
        },
        invitedBy: {
            type: String,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        acceptedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Prevent model recompilation in development
const Invite: Model<IInvite> = mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema);

export default Invite;
