import mongoose from 'mongoose';

const PlatformSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_settings' },
    announcementText: { type: String, default: '' },
    announcementActive: { type: Boolean, default: false },
    announcementLevel: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: String, default: 'SuperAdmin' },
  },
  { timestamps: true }
);

export default mongoose.model('PlatformSetting', PlatformSettingSchema);
