import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  officeLocation: {
    name: string;
    latitude: string;
    longitude: string;
    radius: string;
  };
  wifiIPs: string[];
  company: {
    name: string;
    timezone: string;
    workStartTime: string;
    workEndTime: string;
    checkinWindowStart: string;
    checkinWindowEnd: string;
    checkoutWindowStart: string;
    checkoutWindowEnd: string;
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, default: 'global', unique: true },
  officeLocation: {
    name: { type: String, default: '' },
    latitude: { type: String, default: '' },
    longitude: { type: String, default: '' },
    radius: { type: String, default: '100' }
  },
  wifiIPs: { type: [String], default: [] },
  company: {
    name: { type: String, default: 'My Company' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    workStartTime: { type: String, default: '09:00' },
    workEndTime: { type: String, default: '18:00' },
    checkinWindowStart: { type: String, default: '09:00' },
    checkinWindowEnd: { type: String, default: '10:30' },
    checkoutWindowStart: { type: String, default: '18:30' },
    checkoutWindowEnd: { type: String, default: '20:30' }
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
