import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
    user: mongoose.Types.ObjectId;
    leaveType: mongoose.Types.ObjectId;
    fromDate: Date;
    toDate: Date;
    days: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    adminComments?: string;
    approvedBy?: mongoose.Types.ObjectId;
    contactNumber?: string;
    isHalfDay: boolean;
    halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        leaveType: {
            type: Schema.Types.ObjectId,
            ref: 'LeaveType',
            required: true,
        },
        fromDate: {
            type: Date,
            required: true,
        },
        toDate: {
            type: Date,
            required: true,
        },
        days: {
            type: Number,
            required: true,
            min: 0.5,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
            default: 'PENDING',
            index: true,
        },
        adminComments: {
            type: String,
            trim: true,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        contactNumber: String,
        isHalfDay: {
            type: Boolean,
            default: false
        },
        halfDayType: {
            type: String,
            enum: ['FIRST_HALF', 'SECOND_HALF'],
        }
    },
    { timestamps: true }
);

// Prevent model recompilation in development
const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
