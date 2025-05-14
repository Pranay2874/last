import mongoose from 'mongoose';

export interface IChatSession extends mongoose.Document {
  participants: mongoose.Types.ObjectId[];
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string;
    timestamp: Date;
  }[];
  sessionType: 'random' | 'gender' | 'interest';
  commonInterests?: string[];
  active: boolean;
  startTime: Date;
  endTime?: Date;
}

const chatSessionSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionType: {
    type: String,
    enum: ['random', 'gender', 'interest'],
    required: true
  },
  commonInterests: {
    type: [String],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IChatSession>('ChatSession', chatSessionSchema);