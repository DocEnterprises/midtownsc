import React from 'react';
import { Award } from 'lucide-react';

interface Props {
  userEvents: string[];
}

const events = {
  'e1': {
    title: 'Tasting & Pairing Event',
    date: 'March 25, 2024',
  },
  'e2': {
    title: 'Product Launch Party',
    date: 'April 15, 2024',
  },
  'e3': {
    title: 'Members-Only Social',
    date: 'May 1, 2024',
  }
};

const EventsList: React.FC<Props> = ({ userEvents }) => {
  return (
    <div className="space-y-4">
      {userEvents.length > 0 ? (
        userEvents.map(eventId => {
          const event = events[eventId as keyof typeof events];
          if (!event) return null;
          
          return (
            <div key={eventId} className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-400">{event.date}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400">No upcoming events</p>
      )}
    </div>
  );
};

export default EventsList;