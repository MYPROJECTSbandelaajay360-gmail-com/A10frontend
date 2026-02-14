import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveType extends Document {
    name: string;
    code: string;
    daysAllowed: number;
    description?: string;
    color: string;
    requiresApproval: boolean;
    isActive: boolean;
    paid: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveTypeSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Leave type name is required'],
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Leave code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        daysAllowed: {
            type: Number,
            required: [true, 'Days allowed is required'],
            min: 0,
        },
        description: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            default: '#3B82F6', // Default blue
        },
        requiresApproval: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        paid: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Prevent model recompilation in development
const LeaveType: Model<ILeaveType> = mongoose.models.LeaveType || mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export default LeaveType;
