
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: 'New' | 'Contacted' | 'Queued' | 'Verifying' | 'Active' | 'Rejected';
    source: string;
    assignedTo?: mongoose.Types.ObjectId; // User ID of the agent
    companyName?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeadSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ['New', 'Contacted', 'Queued', 'Verifying', 'Active', 'Rejected'],
            default: 'New'
        },
        source: { type: String, default: 'Website' },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
        companyName: { type: String },
        notes: { type: String }
    },
    { timestamps: true }
);

// Prevent model recompilation in development
const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
