import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, ArrowUpRight, Layers, Trash2, CheckSquare, Users } from 'lucide-react';
import { useState } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';

const COLORS = [
  { bg: 'from-violet-500 to-indigo-600', text: 'text-violet-600 dark:text-violet-400' },
  { bg: 'from-rose-500 to-pink-600',     text: 'text-rose-600 dark:text-rose-400' },
  { bg: 'from-amber-500 to-orange-600',  text: 'text-amber-600 dark:text-amber-400' },
  { bg: 'from-emerald-500 to-teal-600',  text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'from-sky-500 to-blue-600',      text: 'text-sky-600 dark:text-sky-400' },
  { bg: 'from-fuchsia-500 to-purple-600',text: 'text-fuchsia-600 dark:text-fuchsia-400' },
];

function getColor(id) {
  return COLORS[(id?.charCodeAt(0) || 0) % COLORS.length];
}

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data)
  });

  const deleteProject = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries(['projects']); setConfirmDelete(null); }
  });

  const totalTasks  = projects?.reduce((s, p) => s + (p._count?.tasks || 0), 0) || 0;
  const adminCount  = projects?.filter(p => p.members.find(m => m.userId === user?.id)?.role === 'ADMIN').length || 0;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 p-6 lg:p-10">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Workspace</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg">
          <Plus size={16} strokeWidth={2.5} /> New Project
        </button>
      </div>

      {/* Stats */}
      {!isLoading && projects?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Projects',   value: projects.length, icon: Layers },
            { label: 'Tasks',      value: totalTasks,      icon: CheckSquare },
            { label: 'Admin on',   value: adminCount,      icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-[3px] border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin opacity-40" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && projects?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Layers size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No projects yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">Create your first project to start managing tasks with your team.</p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={15} /> Create Project
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && projects?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map(project => {
            const myRole  = project.members.find(m => m.userId === user?.id)?.role;
            const isAdmin = myRole === 'ADMIN';
            const color   = getColor(project.id);
            const total   = project._count?.tasks || 0;
            const done    = project.tasks?.filter(t => t.status === 'DONE').length || 0;
            const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={project.id} className="group relative">
                <Link to={`/projects/${project.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/40 transition-all duration-300">

                  {/* Gradient accent bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${color.bg}`} />

                  <div className="p-5">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-xs font-bold text-white">{getInitials(project.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{project.name}</h3>
                          <span className={`text-xs font-medium ${color.text}`}>{myRole}</span>
                        </div>
                      </div>
                      <ArrowUpRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors mt-0.5 flex-shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                      {project.description || 'No description provided'}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${color.bg} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {project.members.slice(0, 4).map(m => (
                            <div key={m.id} title={m.user.name}
                              className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                              {m.user.name[0].toUpperCase()}
                            </div>
                          ))}
                          {project.members.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                              +{project.members.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <CheckSquare size={12} />
                        <span>{total} task{total !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Delete (admin only, on hover) */}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirmDelete(project); }}
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 shadow-sm"
                    title="Delete project"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add new card */}
          <button onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-gray-400 dark:text-gray-600 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-all min-h-[200px] group/add">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover/add:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <span className="text-sm font-medium">New Project</span>
          </button>
        </div>
      )}

      {/* Delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Delete project?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              <span className="font-medium text-gray-800 dark:text-gray-200">"{confirmDelete.name}"</span> and all its tasks will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                Cancel
              </button>
              <button onClick={() => deleteProject.mutate(confirmDelete.id)}
                disabled={deleteProject.isPending}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 font-medium">
                {deleteProject.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries(['projects'])} />
      )}
    </div>
  );
}