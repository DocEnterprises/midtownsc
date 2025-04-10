import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import EventDetailsModal from './modals/EventDetailsModal';

const events = [
  {
    id: 'e1',
    title: 'Tasting & Pairing Event',
    date: 'March 25, 2024',
    time: '7:00 PM EST',
    location: 'Manhattan Private Lounge',
    description: 'Join us for an exclusive evening of cannabis and cuisine pairing',
    image: 'https://images.unsplash.com/photo-1617375407936-02c78ad417b8?auto=format&fit=crop&q=80&w=800',
    capacity: 50,
    rsvpCount: 32,
    details: {
      schedule: [
        '6:30 PM - Check-in & Welcome Drinks',
        '7:00 PM - Introduction to Cannabis Pairing',
        '7:30 PM - Guided Tasting Experience',
        '8:30 PM - Networking & Social Hour'
      ],
      speakers: [
        { name: 'Chef Michael Green', role: 'Head Chef & Cannabis Expert' },
        { name: 'Dr. Sarah Johnson', role: 'Cannabis Sommelier' }
      ],
      amenities: [
        'Welcome Gift Bag',
        'Complimentary Valet',
        'Full Course Dinner',
        'Premium Cannabis Samples'
      ]
    }
  }
];

const Events: React.FC = () => {
  const { user, openAuthModal } = useStore();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleRsvp = async (eventId: string) => {
    if (!user) {
      openAuthModal('signin', () => handleRsvp(eventId));
      return;
    }

    setLoading(prev => ({ ...prev, [eventId]: true }));

    try {
      const userEvents = user.events || [];
      const isRsvpd = userEvents.includes(eventId);

      if (isRsvpd) {
        useStore.setState(state => ({
          user: state.user ? {
            ...state.user,
            events: state.user.events.filter(id => id !== eventId)
          } : null
        }));
        toast.success('RSVP cancelled');
      } else {
        useStore.setState(state => ({
          user: state.user ? {
            ...state.user,
            events: [...(state.user.events || []), eventId]
          } : null
        }));
        toast.success('RSVP confirmed!');
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
    } finally {
      setLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <section id="events" className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Exclusive Events</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join us for members-only events featuring product launches, 
            tasting sessions, and networking opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const isRsvpd = user?.events?.includes(event.id);
            const isLoading = loading[event.id];

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4">{event.title}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <p className="text-gray-300">{event.description}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRsvp(event.id);
                    }}
                    disabled={isLoading}
                    className={`w-full button-primary ${
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
              </motion.div>
            );
          })}
        </div>
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRsvp={() => selectedEvent && handleRsvp(selectedEvent.id)}
        isRsvpd={selectedEvent ? user?.events?.includes(selectedEvent.id) : false}
        isLoading={selectedEvent ? loading[selectedEvent.id] : false}
      />
    </section>
  );
};

export default Events;