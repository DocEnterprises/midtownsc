import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Award, CheckCircle, Edit2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import EventForm from '../admin/EventForm';

interface Props {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onRsvp: () => void;
  isRsvpd: boolean;
  isLoading: boolean;
}

const EventDetailsModal: React.FC<Props> = ({
  event,
  isOpen,
  onClose,
  onRsvp,
  isRsvpd,
  isLoading
}) => {
  const { user } = useStore();
  const [showEditForm, setShowEditForm] = useState(false);

  if (!event) return null;

  const isAdmin = user?.email === 'admin@skyclub.com';

  const handleEditSubmit = async (updatedEvent: any) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      await updateDoc(eventRef, updatedEvent);
      toast.success('Event updated successfully');
      setShowEditForm(false);
      // Refresh the event data
      window.location.reload();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-2 hover:bg-white/10 rounded-full"
                  title="Edit Event"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold mb-4">{event.title}</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span>{event.rsvpCount} attending</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Schedule</h3>
                  <div className="space-y-2">
                    {event.details.schedule.map((item: string, index: number) => (
                      <div key={index} className="text-sm text-gray-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Speakers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {event.details.speakers.map((speaker: any, index: number) => (
                      <div key={index} className="glass p-4 rounded-lg">
                        <p className="font-medium">{speaker.name}</p>
                        <p className="text-sm text-gray-400">{speaker.role}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.details.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <span className="text-gray-400">Spots Left</span>
                  <p className="text-2xl font-bold">
                    {event.capacity - event.rsvpCount}
                  </p>
                </div>
                <button
                  onClick={onRsvp}
                  disabled={isLoading}
                  className={`button-primary ${
                    isRsvpd ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : isRsvpd ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      RSVP'd
                    </div>
                  ) : (
                    'RSVP Now'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showEditForm && (
        <EventForm
          event={event}
          onClose={() => setShowEditForm(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </AnimatePresence>
  );
};

export default EventDetailsModal;