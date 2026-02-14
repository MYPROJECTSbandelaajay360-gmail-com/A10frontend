import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShift extends Document {
    name: string;
    startTime: string; // HH:mm format (24h)
    endTime: string;   // HH:mm format (24h)
    workDays: string[]; // ['Monday', 'Tuesday', ...]
    color: string;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ShiftSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Shift name is required'],
            unique: true,
            trim: true,
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Simple HH:mm regex
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        workDays: {
            type: [String],
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
        color: {
            type: String,
            default: '#3B82F6',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        notes: {
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

// Prevent model recompilation in development
const Shift: Model<IShift> = mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);

export default Shift;
