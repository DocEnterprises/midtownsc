import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface Props {
  event?: any;
  onClose: () => void;
  onSubmit: (event: any) => Promise<void>;
}

const EventForm: React.FC<Props> = ({ event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(event || {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
    image: '',
    details: {
      schedule: [''],
      speakers: [{ name: '', role: '' }],
      amenities: ['']
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: [...prev.details.schedule, '']
      }
    }));
  };

  const updateScheduleItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: prev.details.schedule.map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const removeScheduleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        schedule: prev.details.schedule.filter((_, i) => i !== index)
      }
    }));
  };

  const addSpeaker = () => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: [...prev.details.speakers, { name: '', role: '' }]
      }
    }));
  };

  const updateSpeaker = (index: number, field: 'name' | 'role', value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: prev.details.speakers.map((speaker, i) =>
          i === index ? { ...speaker, [field]: value } : speaker
        )
      }
    }));
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        speakers: prev.details.speakers.filter((_, i) => i !== index)
      }
    }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        amenities: [...prev.details.amenities, '']
      }
    }));
  };

  const updateAmenity = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        amenities: prev.details.amenities.map((item, i) =>
          i === index ? value : item
        )
      }
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        amenities: prev.details.amenities.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Schedule</label>
            {formData.details.schedule.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateScheduleItem(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  placeholder="Schedule item"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeScheduleItem(index)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addScheduleItem}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              + Add Schedule Item
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Speakers</label>
            {formData.details.speakers.map((speaker, index) => (
              <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={speaker.name}
                  onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                  className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  placeholder="Speaker name"
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={speaker.role}
                    onChange={(e) => updateSpeaker(index, 'role', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                    placeholder="Speaker role"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpeaker}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              + Add Speaker
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            {formData.details.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={amenity}
                  onChange={(e) => updateAmenity(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:border-purple-500"
                  placeholder="Amenity"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAmenity}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              + Add Amenity
            </button>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : event ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EventForm;