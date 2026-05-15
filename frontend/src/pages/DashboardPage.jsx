import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, AlertCircle, CheckCircle2, Clock, Layers, ArrowRight, ListCheck, Notebook, Table, ListFilterPlusIcon, ListIcon } from 'lucide-react';
import { useState } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(r => r.data)
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data)
  });

  const statusCount = (status) =>
    stats?.tasksByStatus?.find(s => s.status === status)?._count?.status || 0;

  const statCards = [
    { label: 'Total Projects', value: projects?.length || 0, icon: Layers, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/30' },
    { label: 'To Do', value: statusCount('TODO'), icon: ListIcon, color: 'text-gray-600 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
    { label: 'In Progress', value: statusCount('IN_PROGRESS'), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'Completed', value: statusCount('DONE'), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here's your team's progress overview
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Projects Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Projects</h2>
        <span className="text-sm text-gray-400 dark:text-gray-500">{projects?.length || 0} total</span>
      </div>

      {/* Empty State */}
      {projects?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Layers size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No projects yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Create your first project to get started
          </p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {projects?.map(project => {
            const myRole = project.members.find(m => m.userId === user?.id)?.role;
            const doneTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
            const totalTasks = project._count.tasks;
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all group">

                {/* Project Title + Role Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                    myRole === 'ADMIN'
                      ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {myRole}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                  {project.description || 'No description provided'}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex items-center gap-3">
                    <span>{totalTasks} tasks</span>
                    <span>{project.members.length} members</span>
                  </div>
                  <ArrowRight size={14} className="group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => qc.invalidateQueries(['projects'])} />
      )}
    </div>
  );
}