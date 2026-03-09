import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, FolderKanban } from 'lucide-react';

const SKILLS = ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL', 'Machine Learning', 'Data Science', 'C++', 'PHP', 'Django', 'Spring Boot', 'Docker', 'Git'];
const statusBadge = { available: 'badge-yellow', allocated: 'badge-blue', 'in-progress': 'badge-purple', completed: 'badge-cyan', approved: 'badge-green' };

function CreateProjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', requiredSkills: [], dueDate: '', batch: '', semester: 1, maxMarks: 100 });
  const [loading, setLoading] = useState(false);

  const toggleSkill = (s) => setForm(f => ({ ...f, requiredSkills: f.requiredSkills.includes(s) ? f.requiredSkills.filter(sk => sk !== s) : [...f.requiredSkills, s] }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/tasks/projects', form);
      toast.success('Project created! Students can now choose it based on skills.');
      onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FolderKanban size={18} className="text-rose-400" /> Create Project</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="label">Project Title</label><input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="E-Commerce Web App" /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Project overview and objectives..." /></div>
          <div>
            <label className="label">Required Skills (students will be matched based on these)</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button type="button" key={s} onClick={() => toggleSkill(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.requiredSkills.includes(s) ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Due Date</label><input className="input" type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label className="label">Max Marks</label><input className="input" type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: Number(e.target.value) })} /></div>
            <div><label className="label">Batch</label><input className="input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="2021-2025" /></div>
            <div><label className="label">Semester</label>
              <select className="input" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
            <p className="text-xs text-rose-400">🎯 Students choose this project based on their skill set. Best skill match gets allocated.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApproveModal({ project, onClose, onApprove }) {
  const [feedback, setFeedback] = useState(project.adminFeedback || '');
  const [marks, setMarks] = useState(project.obtainedMarks || '');
  const [loading, setLoading] = useState(false);
  const handle = async () => { setLoading(true); try { await onApprove(project._id, 'approved', feedback, marks); onClose(); } finally { setLoading(false); } };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Approve Project</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="font-medium text-white">{project.title}</p>
            <p className="text-xs text-slate-500 mt-1">Student: {project.allocatedTo?.name} ({project.allocatedTo?.studentId})</p>
            {project.studentChosenSkills?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.studentChosenSkills.map(s => <span key={s} className="badge-purple text-xs">{s}</span>)}
              </div>
            )}
          </div>
          <div><label className="label">Feedback</label><textarea className="input resize-none" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          <div><label className="label">Marks (out of {project.maxMarks})</label><input className="input" type="number" min="0" max={project.maxMarks} value={marks} onChange={e => setMarks(e.target.value)} /></div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handle} disabled={loading} className="btn-success flex-1 flex items-center justify-center gap-2"><CheckCircle size={15} /> Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [approveProject, setApproveProject] = useState(null);

  const fetchData = async () => { try { const r = await api.get('/tasks/projects'); setProjects(r.data); } catch { toast.error('Failed'); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id, status, feedback, marks) => {
    try {
      const r = await api.put(`/tasks/projects/${id}/approve`, { status, adminFeedback: feedback, obtainedMarks: marks });
      setProjects(projects.map(p => p._id === id ? r.data : p));
      toast.success('Project approved!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Skill-based project allocation — students choose their project</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Project</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Available', projects.filter(p => p.status === 'available').length, 'text-amber-400'],
          ['Allocated', projects.filter(p => p.status === 'allocated').length, 'text-blue-400'],
          ['In Progress', projects.filter(p => p.status === 'in-progress').length, 'text-violet-400'],
          ['Approved', projects.filter(p => p.status === 'approved').length, 'text-emerald-400']].map(([l, v, c]) => (
          <div key={l} className="card text-center"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>
      <div className="table-container">
        <table className="table">
          <thead><tr><th>Project</th><th>Required Skills</th><th>Allocated To</th><th>Student Skills</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-10 text-slate-500">Loading...</td></tr>
              : projects.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-slate-500">No projects yet</td></tr>
              : projects.map(p => (
                <tr key={p._id}>
                  <td><p className="font-medium text-slate-200">{p.title}</p><p className="text-xs text-slate-500 line-clamp-1">{p.description}</p></td>
                  <td><div className="flex flex-wrap gap-1">{p.requiredSkills?.slice(0, 3).map(s => <span key={s} className="badge-rose text-xs">{s}</span>)}</div></td>
                  <td>{p.allocatedTo ? <><p className="text-sm text-slate-200">{p.allocatedTo.name}</p><p className="text-xs text-slate-500">{p.allocatedTo.studentId}</p></> : <span className="text-slate-500 text-xs">Unallocated</span>}</td>
                  <td><div className="flex flex-wrap gap-1">{p.studentChosenSkills?.slice(0, 2).map(s => <span key={s} className="badge-purple text-xs">{s}</span>)}</div></td>
                  <td className="text-slate-400 text-xs">{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td><span className={statusBadge[p.status] || 'badge-yellow'}>{p.status}</span></td>
                  <td>{['allocated', 'in-progress', 'completed'].includes(p.status) && (
                    <button onClick={() => setApproveProject(p)} className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}{p.status === 'approved' && <span className="text-xs text-emerald-400">✓ Done</span>}
                  {p.status === 'available' && <span className="text-xs text-slate-500">Open for students</span>}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onSuccess={fetchData} />}
      {approveProject && <ApproveModal project={approveProject} onClose={() => setApproveProject(null)} onApprove={handleApprove} />}
    </div>
  );
}
