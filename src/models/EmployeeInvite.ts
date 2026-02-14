import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployeeInvite extends Document {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    department: string;
    designation: string;
    employeeId?: string;
    salary?: number;
    joiningDate: Date;
    reportingManager?: string;
    status: 'pending' | 'accepted' | 'revoked' | 'expired';
    invitedBy: string;
    invitedByName?: string;
    token: string;
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeInviteSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true,
        },
        designation: {
            type: String,
            required: [true, 'Designation is required'],
            trim: true,
        },
        employeeId: {
            type: String,
            trim: true,
        },
        salary: {
            type: Number,
        },
        joiningDate: {
            type: Date,
            required: [true, 'Joining date is required'],
        },
        reportingManager: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'revoked', 'expired'],
            default: 'pending',
        },
        invitedBy: {
            type: String,
            required: true,
        },
        invitedByName: {
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

// Index for faster queries
EmployeeInviteSchema.index({ email: 1, status: 1 });
EmployeeInviteSchema.index({ token: 1 });

// Prevent model recompilation in development
const EmployeeInvite: Model<IEmployeeInvite> =
    mongoose.models.EmployeeInvite || mongoose.model<IEmployeeInvite>('EmployeeInvite', EmployeeInviteSchema);

export default EmployeeInvite;
