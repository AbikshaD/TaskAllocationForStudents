import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, FlaskConical } from 'lucide-react';

const statusBadge = { allocated: 'badge-yellow', completed: 'badge-blue', approved: 'badge-green' };

function AllocateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: '', dueDate: '', batch: '', semester: 1, tasks: [{ title: '', description: '', labNumber: 1 }] });
  const [loading, setLoading] = useState(false);
  const addTask = () => setForm(f => ({ ...f, tasks: [...f.tasks, { title: '', description: '', labNumber: f.tasks.length + 1 }] }));
  const removeTask = (i) => setForm(f => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }));
  const updateTask = (i, field, val) => setForm(f => ({ ...f, tasks: f.tasks.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.post('/tasks/lab-tasks/allocate', form);
      toast.success(res.data.message); onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FlaskConical size={18} className="text-cyan-400" /> Create Lab Tasks</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Database Lab" /></div>
            <div><label className="label">Due Date</label><input className="input" type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label className="label">Batch</label><input className="input" required value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="2021-2025" /></div>
            <div><label className="label">Semester</label>
              <select className="input" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Lab Tasks</label>
              <button type="button" onClick={addTask} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"><Plus size={12} /> Add Lab</button>
            </div>
            {form.tasks.map((task, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-3">
                <div className="flex justify-between mb-2"><span className="text-xs text-slate-500">Lab {task.labNumber}</span>
                  {form.tasks.length > 1 && <button type="button" onClick={() => removeTask(i)}><X size={14} className="text-red-400" /></button>}</div>
                <input className="input mb-2" required value={task.title} onChange={e => updateTask(i, 'title', e.target.value)} placeholder="Lab task title e.g. Implement Binary Tree" />
                <textarea className="input resize-none" rows={2} value={task.description} onChange={e => updateTask(i, 'description', e.target.value)} placeholder="Instructions (optional)" />
              </div>
            ))}
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
            <p className="text-xs text-cyan-400">📋 Lab tasks will be assigned to ALL students in the batch. Admin approves directly — no file submission needed.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create & Assign'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApproveModal({ task, onClose, onApprove }) {
  const [feedback, setFeedback] = useState(task.adminFeedback || '');
  const [marks, setMarks] = useState(task.obtainedMarks || '');
  const [loading, setLoading] = useState(false);
  const handle = async () => { setLoading(true); try { await onApprove(task._id, 'approved', feedback, marks); onClose(); } finally { setLoading(false); } };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Approve Lab Task</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="font-medium text-white">{task.title}</p>
            <p className="text-xs text-slate-400 mt-1">{task.subject} · Lab {task.labNumber}</p>
            <p className="text-xs text-slate-500 mt-1">Student: {task.allocatedTo?.name} ({task.allocatedTo?.studentId})</p>
          </div>
          <div><label className="label">Feedback</label><textarea className="input resize-none" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          <div><label className="label">Marks (out of {task.maxMarks})</label><input className="input" type="number" min="0" max={task.maxMarks} value={marks} onChange={e => setMarks(e.target.value)} /></div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handle} disabled={loading} className="btn-success flex-1 flex items-center justify-center gap-2"><CheckCircle size={15} /> Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLabTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [approveTask, setApproveTask] = useState(null);

  const fetchData = async () => { try { const r = await api.get('/tasks/lab-tasks'); setTasks(r.data); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, status, feedback, marks) => {
    try {
      const r = await api.put(`/tasks/lab-tasks/${id}/approve`, { status, adminFeedback: feedback, obtainedMarks: marks });
      setTasks(tasks.map(t => t._id === id ? r.data : t));
      toast.success('Lab task approved!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Lab Tasks</h1>
          <p className="text-slate-400 mt-1">Assign and approve lab work — no file upload required</p></div>
        <button onClick={() => setShowAllocate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Lab Tasks</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Total', tasks.length, 'text-white'], ['Pending Approval', tasks.filter(t => t.status === 'allocated').length, 'text-amber-400'],
          ['Approved', tasks.filter(t => t.status === 'approved').length, 'text-emerald-400']].map(([l, v, c]) => (
          <div key={l} className="card text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Lab Task</th><th>Subject</th><th>Lab #</th><th>Student</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-10 text-slate-500">Loading...</td></tr>
              : tasks.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-slate-500">No lab tasks yet</td></tr>
              : tasks.map(t => (
                <tr key={t._id}>
                  <td className="font-medium text-slate-200 max-w-[180px] truncate">{t.title}</td>
                  <td className="text-slate-400 text-xs">{t.subject}</td>
                  <td><span className="badge-cyan">Lab {t.labNumber}</span></td>
                  <td><p className="text-sm text-slate-200">{t.allocatedTo?.name}</p><p className="text-xs text-slate-500">{t.allocatedTo?.studentId}</p></td>
                  <td className="text-slate-400 text-xs">{new Date(t.dueDate).toLocaleDateString()}</td>
                  <td><span className={statusBadge[t.status]}>{t.status}</span></td>
                  <td>{t.status !== 'approved' && (
                    <button onClick={() => setApproveTask(t)} className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}{t.status === 'approved' && <span className="text-xs text-emerald-400">✓ Done</span>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} onSuccess={fetchData} />}
      {approveTask && <ApproveModal task={approveTask} onClose={() => setApproveTask(null)} onApprove={handleApprove} />}
    </div>
  );
}
