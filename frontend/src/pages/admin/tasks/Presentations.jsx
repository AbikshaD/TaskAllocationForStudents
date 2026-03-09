import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, XCircle, Eye, Shuffle, Monitor } from 'lucide-react';

const statusBadge = { allocated: 'badge-yellow', submitted: 'badge-blue', approved: 'badge-green', rejected: 'badge-red' };

function AllocateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: '', dueDate: '', batch: '', semester: 1, topics: [{ title: '', description: '' }] });
  const [loading, setLoading] = useState(false);

  const addTopic = () => setForm(f => ({ ...f, topics: [...f.topics, { title: '', description: '' }] }));
  const removeTopic = (i) => setForm(f => ({ ...f, topics: f.topics.filter((_, idx) => idx !== i) }));
  const updateTopic = (i, field, val) => setForm(f => ({ ...f, topics: f.topics.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks/presentations/allocate', form);
      toast.success('Presentations randomly allocated!');
      onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <div className="flex items-center gap-2"><Shuffle size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Allocate Presentations</h2></div>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Computer Networks" /></div>
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
              <label className="label mb-0">Presentation Topics</label>
              <button type="button" onClick={addTopic} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {form.topics.map((topic, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-3">
                <div className="flex justify-between mb-2"><span className="text-xs text-slate-500">Topic {i + 1}</span>
                  {form.topics.length > 1 && <button type="button" onClick={() => removeTopic(i)}><X size={14} className="text-red-400" /></button>}</div>
                <input className="input mb-2" required value={topic.title} onChange={e => updateTopic(i, 'title', e.target.value)} placeholder="Presentation topic" />
                <textarea className="input resize-none" rows={2} value={topic.description} onChange={e => updateTopic(i, 'description', e.target.value)} placeholder="Description (optional)" />
              </div>
            ))}
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
            <p className="text-xs text-emerald-400">🎲 Topics will be randomly allocated. Students must submit a PPT file.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Allocating...' : 'Allocate Randomly'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewModal({ item, onClose, onApprove }) {
  const [feedback, setFeedback] = useState(item.adminFeedback || '');
  const [marks, setMarks] = useState(item.obtainedMarks || '');
  const [loading, setLoading] = useState(false);
  const handleAction = async (status) => { setLoading(true); try { await onApprove(item._id, status, feedback, marks); onClose(); } finally { setLoading(false); } };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Review Presentation</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="font-medium text-white">{item.title}</p>
            <p className="text-xs text-slate-400 mt-1">{item.subject}</p>
            <p className="text-xs text-slate-500">By: {item.allocatedTo?.name} ({item.allocatedTo?.studentId})</p>
            {item.submittedFile && (
              <a href={`/uploads/${item.submittedFile}`} target="_blank" rel="noreferrer"
                className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                <Monitor size={12} /> View PPT File
              </a>
            )}
          </div>
          <div><label className="label">Feedback</label><textarea className="input resize-none" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          <div><label className="label">Marks (out of {item.maxMarks})</label><input className="input" type="number" min="0" max={item.maxMarks} value={marks} onChange={e => setMarks(e.target.value)} /></div>
          <div className="flex gap-3">
            <button onClick={() => handleAction('rejected')} disabled={loading} className="btn-danger flex-1 flex items-center justify-center gap-2"><XCircle size={15} /> Reject</button>
            <button onClick={() => handleAction('approved')} disabled={loading} className="btn-success flex-1 flex items-center justify-center gap-2"><CheckCircle size={15} /> Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPresentations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetchData = async () => {
    try { const res = await api.get('/tasks/presentations'); setItems(res.data); }
    catch { toast.error('Failed to fetch'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, status, feedback, marks) => {
    try {
      const res = await api.put(`/tasks/presentations/${id}/approve`, { status, adminFeedback: feedback, obtainedMarks: marks });
      setItems(items.map(i => i._id === id ? res.data : i));
      toast.success(`Presentation ${status}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Presentations</h1>
          <p className="text-slate-400 mt-1">Review and approve student presentations (PPT)</p></div>
        <button onClick={() => setShowAllocate(true)} className="btn-primary flex items-center gap-2"><Shuffle size={16} /> Allocate Presentations</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total', items.length, 'text-white'], ['Pending', items.filter(i => i.status === 'allocated').length, 'text-amber-400'],
          ['Submitted', items.filter(i => i.status === 'submitted').length, 'text-blue-400'],
          ['Approved', items.filter(i => i.status === 'approved').length, 'text-emerald-400']].map(([l, v, c]) => (
          <div key={l} className="card text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Topic</th><th>Subject</th><th>Allocated To</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-10 text-slate-500">Loading...</td></tr>
              : items.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-slate-500">No presentations yet</td></tr>
              : items.map(a => (
                <tr key={a._id}>
                  <td className="font-medium text-slate-200 max-w-[200px] truncate">{a.title}</td>
                  <td className="text-slate-400 text-xs">{a.subject}</td>
                  <td><p className="text-sm text-slate-200">{a.allocatedTo?.name}</p><p className="text-xs text-slate-500">{a.allocatedTo?.studentId}</p></td>
                  <td className="text-slate-400 text-xs">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td><span className={statusBadge[a.status]}>{a.status}</span></td>
                  <td>{a.status === 'submitted' && <button onClick={() => setViewItem(a)} className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg"><Eye size={13} /> Review</button>}
                    {a.status === 'approved' && <span className="text-xs text-emerald-400">✓ Approved</span>}
                    {a.status === 'allocated' && <span className="text-xs text-slate-500">Awaiting PPT</span>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} onSuccess={fetchData} />}
      {viewItem && <ReviewModal item={viewItem} onClose={() => setViewItem(null)} onApprove={handleApprove} />}
    </div>
  );
}
