//src/components/SupportTimeline.tsx
'use client'

import React from 'react';
import { Database } from '@/types/database';

type ConsultationEvent = Database['public']['Tables']['consultation_events']['Row'];

interface SupportTimelineProps {
  events: ConsultationEvent[];
}

const SupportTimeline: React.FC<SupportTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">支援履歴はまだありません。</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id} className="relative pl-8">
          <div className="absolute left-0 top-1 h-full w-px bg-gray-300"></div>
          <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
          
          <p className="text-sm font-semibold text-gray-800">{formatDate(event.created_at)}</p>
          <p className="text-sm text-gray-500">担当: {event.staff_name}</p>

          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center text-sm">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md">{event.status_from || '新規'}</span>
              <span className="mx-2 text-gray-500">→</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">{event.status_to}</span>
            </div>
            {event.next_action_memo && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs font-semibold text-gray-600">ネクストアクション:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{event.next_action_memo}</p>
                {event.next_action_due_date && (
                  <p className="text-xs text-gray-500">期限: {event.next_action_due_date}</p>
                )}
              </div>
            )}
            {event.note && (
               <div className="mt-2 pt-2 border-t">
                <p className="text-xs font-semibold text-gray-600">補足メモ:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{event.note}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportTimeline;