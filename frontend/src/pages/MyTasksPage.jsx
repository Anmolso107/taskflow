import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, Flag, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

const PRIORITY_COLORS = {
  LOW:    'text-gray-400 bg-gray-50 dark:bg-gray-800',
  MEDIUM: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
  HIGH:   'text-orange-500 bg-orange-50 dark:bg-orange-900/30',
  URGENT: 'text-red-500 bg-red-50 dark:bg-red-900/30',
};

const STATUS_ICONS = {
  TODO:        <Clock size={14} className="text-gray-400" />,
  IN_PROGRESS: <Loader2 size={14} className="text-blue-500 animate-spin" />,
  IN_REVIEW:   <AlertCircle size={14} className="text-yellow-500" />,
  DONE:        <CheckCircle2 size={14} className="text-green-500" />,
};

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL');

  // Fetch all projects to get tasks assigned to user
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data)
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(r => r.data)
  });

  // Fetch tasks for each project and flatten
  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks', projects],
    enabled: !!projects?.length,
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(p =>
          api.get(`/projects/${p.id}/tasks`, { params: { assigneeId: user?.id } })
            .then(r => r.data.map(t => ({ ...t, projectName: p.name, projectId: p.id })))
        )
      );
      return results.flat();
    }
  });

  const filtered = allTasks?.filter(t =>
    filter === 'ALL' ? true : t.status === filter
  ) || [];

  const overdue = filtered.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  );

  const statusCount = (status) =>
    stats?.tasksByStatus?.find(s => s.status === status)?._count?.status || 0;

  const filterTabs = [
    { id: 'ALL', label: 'All Tasks', count: allTasks?.length || 0 },
    { id: 'TODO', label: 'To Do', count: statusCount('TODO') },
    { id: 'IN_PROGRESS', label: 'In Progress', count: statusCount('IN_PROGRESS') },
    { id: 'IN_REVIEW', label: 'In Review', count: statusCount('IN_REVIEW') },
    { id: 'DONE', label: 'Done', count: statusCount('DONE') },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          All tasks assigned to you across projects
        </p>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
            You have <span className="font-bold">{overdue.length}</span> overdue {overdue.length === 1 ? 'task' : 'tasks'} that need attention!
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
            {tab.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {(isLoading || tasksLoading) && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !tasksLoading && filtered.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <CheckCircle2 size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {filter === 'ALL' ? 'You have no tasks assigned yet' : `No tasks with status "${STATUS_LABELS[filter]}"`}
          </p>
        </div>
      )}

      {/* Tasks List */}
      {!isLoading && !tasksLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(task => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
            return (
              <div key={task.id}
                className={`bg-white dark:bg-gray-900 rounded-xl border p-4 transition-all hover:shadow-sm ${
                  isOverdue
                    ? 'border-red-200 dark:border-red-900'
                    : 'border-gray-200 dark:border-gray-800'
                }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {STATUS_ICONS[task.status]}
                      <h3 className={`text-sm font-semibold truncate ${
                        task.status === 'DONE'
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Project badge */}
                      <span className="text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                        {task.projectName}
                      </span>
                      {/* Status badge */}
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {STATUS_LABELS[task.status]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Priority */}
                    <span className={`text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1 ${PRIORITY_COLORS[task.priority]}`}>
                      <Flag size={10} />
                      {task.priority}
                    </span>
                    {/* Due date */}
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isOverdue
                          ? 'text-red-500 dark:text-red-400 font-medium'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        <Calendar size={11} />
                        {isOverdue ? '⚠ ' : ''}
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}