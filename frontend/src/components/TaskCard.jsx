import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';

const PRIORITY_COLORS = {
  LOW:    'text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
  MEDIUM: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH:   'text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'text-red-500 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function TaskCard({ task, onStatusChange, isAdmin, projectId, currentUserId }) {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const canDelete = isAdmin || task.creator?.id === currentUserId;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    await api.delete(`/projects/${projectId}/tasks/${task.id}`);
    qc.invalidateQueries(['project', projectId]);
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-all
        ${isOverdue
          ? 'border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}>

      {/* Title Row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug flex-1">
          {task.title}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Priority Badge */}
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority[0]}
          </span>

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5">
              <Trash2 size={13} />
            </button>
          )}

          {/* Expand Chevron */}
          <ChevronDown
            size={13}
            className={`text-gray-300 dark:text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-2 space-y-2" onClick={e => e.stopPropagation()}>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-2">
              {task.description}
            </p>
          )}

          {/* Status Selector */}
          <div>
            <label className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">
              Move to
            </label>
            <select
              value={task.status}
              onChange={e => onStatusChange(e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors">
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Footer: Assignee + Due Date */}
      <div className="flex items-center gap-3 mt-2">
        {task.assignee && (
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <div className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 text-xs flex items-center justify-center font-semibold">
              {task.assignee.name[0].toUpperCase()}
            </div>
            <span>{task.assignee.name.split(' ')[0]}</span>
          </div>
        )}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue
              ? 'text-red-500 dark:text-red-400 font-medium'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            <Calendar size={11} />
            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
}