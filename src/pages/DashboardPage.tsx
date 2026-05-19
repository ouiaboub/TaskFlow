import React, { useEffect, useState } from 'react';

export default function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'TODO' });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch('http://localhost:8080/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
         onLogout();
         return;
      }
      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [onLogout]);

  const handleOpenModal = (task: any = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, description: task.description, status: task.status });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'TODO' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token');
    const url = editingTask ? `http://localhost:8080/api/tasks/${editingTask.id}` : 'http://localhost:8080/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        handleCloseModal();
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">TaskFlow</h1>
          </div>
          <button 
            onClick={onLogout} 
            className="px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Déconnexion
          </button>
        </header>

        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Mes Tâches</h2>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-medium transition-colors">
              + Nouvelle Tâche
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
               <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-12 rounded-3xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune tâche pour le moment.</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">Commencez par en créer une pour vous organiser !</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.status === 'DONE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {task.status}
                    </span>
                    <button onClick={() => handleOpenModal(task)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ex: Faire les courses"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="Détails de la tâche..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="TODO">À faire</option>
                  <option value="DONE">Terminé</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
