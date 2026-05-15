import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { useState } from 'react';
import { Plus, UserPlus, ArrowLeft, Settings } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', label: '📋 To Do', color: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' },
  { id: 'IN_PROGRESS', label: '⚡ In Progress', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900' },
  { id: 'IN_REVIEW', label: '🔍 In Review', color: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900' },
  { id: 'DONE', label: '✅ Done', color: 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900' },
];
export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data)
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
    onSuccess: () => qc.invalidateQueries(['project', projectId])
  });

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const myRole = project?.members.find(m => m.userId === user?.id)?.role;
  const isAdmin = myRole === 'ADMIN';
  const tasksByStatus = (status) => project?.tasks.filter(t => t.status === status) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
          {isAdmin && <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">Admin</span>}
        </div>
        {project?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">{project.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 ml-7">
          {/* Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project?.members.map(m => (
                <div key={m.id}
                  title={`${m.user.name} (${m.role})`}
                  className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center border-2 border-white">
                  {m.user.name[0].toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{project?.members.length} members</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <UserPlus size={14} /> Invite
              </button>
            )}
            <button onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
              <Plus size={14} /> Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(col => (
            <div key={col.id} className={`w-72 rounded-xl border ${col.color} flex flex-col`}>
              <div className="px-4 py-3 border-b border-inherit">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</h3>
                  <span className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5 font-medium">
                    {tasksByStatus(col.id).length}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {tasksByStatus(col.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-300 dark:text-gray-600 text-xs">No tasks</div>
                ) : (
                  tasksByStatus(col.id).map(task => (
                    <TaskCard key={task.id} task={task}
                      onStatusChange={(status) => updateTask.mutate({ taskId: task.id, data: { status } })}
                      isAdmin={isAdmin}
                      projectId={projectId}
                      currentUserId={user?.id} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <CreateTaskModal projectId={projectId} members={project?.members || []}
          onClose={() => setShowTaskModal(false)}
          onCreated={() => qc.invalidateQueries(['project', projectId])} />
      )}
      {showInviteModal && (
        <InviteMemberModal projectId={projectId}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => qc.invalidateQueries(['project', projectId])} />
      )}
    </div>
  );
}
