import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle, XCircle, Eye, Shuffle, FileText, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function AllocateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: '', dueDate: '', batch: '', semester: 1, topics: [{ title: '', description: '' }] });
  const [loading, setLoading] = useState(false);

  const addTopic = () => setForm(f => ({ ...f, topics: [...f.topics, { title: '', description: '' }] }));
  const removeTopic = (i) => setForm(f => ({ ...f, topics: f.topics.filter((_, idx) => idx !== i) }));
  const updateTopic = (i, field, val) => setForm(f => ({
    ...f, topics: f.topics.map((t, idx) => idx === i ? { ...t, [field]: val } : t)
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks/assignments/allocate', form);
      toast.success('Assignments randomly allocated!');
      onSuccess();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <div className="flex items-center gap-2">
            <Shuffle size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Allocate Assignments</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input className="input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Data Structures" />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Batch</label>
              <input className="input" required value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="2021-2025" />
            </div>
            <div>
              <label className="label">Semester</label>
              <select className="input" value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Assignment Topics</label>
              <button type="button" onClick={addTopic} className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                <Plus size={12} /> Add Topic
              </button>
            </div>
            <div className="space-y-3">
              {form.topics.map((topic, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Topic {i + 1}</span>
                    {form.topics.length > 1 && (
                      <button type="button" onClick={() => removeTopic(i)} className="text-red-400 hover:text-red-300">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input className="input mb-2" required value={topic.title}
                    onChange={e => updateTopic(i, 'title', e.target.value)}
                    placeholder="Assignment topic title" />
                  <textarea className="input resize-none" rows={2} value={topic.description}
                    onChange={e => updateTopic(i, 'description', e.target.value)}
                    placeholder="Description (optional)" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
            <p className="text-xs text-blue-400">🎲 Topics will be randomly allocated to students in the selected batch/semester</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Allocating...' : 'Allocate Randomly'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewSubmissionModal({ assignment, onClose, onApprove, allSubmitted, currentIndex, onNext, onPrev }) {
  const [feedback, setFeedback] = useState(assignment.adminFeedback || '');
  const [marks, setMarks] = useState(assignment.obtainedMarks || '');
  const [loading, setLoading] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const handleAction = async (status) => {
    if (!marks && marks !== 0) {
      return toast.error('Please enter marks');
    }
    setLoading(true);
    try {
      await onApprove(assignment._id, status, feedback, marks);
      onClose();
    } finally { setLoading(false); }
  };

  const hasNext = currentIndex < allSubmitted.length - 1;
  const hasPrev = currentIndex > 0;
  const daysOverdue = assignment.dueDate ? Math.ceil((new Date() - new Date(assignment.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
  const fileUrl = `/uploads/${assignment.submittedFile}`;
  const isPDF = assignment.submittedFile?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Review Submission</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-slate-700/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-white mb-2">{assignment.title}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <p>📚 Subject: {assignment.subject}</p>
                <p>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                {daysOverdue > 0 && <p className="col-span-2 text-red-400">⚠️ {daysOverdue} days overdue</p>}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-500 font-medium mb-3">STUDENT SUBMISSION</p>
              <div className="space-y-2">
                <p className="text-sm text-white font-medium">{assignment.allocatedTo?.name}</p>
                <p className="text-xs text-slate-400">{assignment.allocatedTo?.studentId}</p>
                {assignment.submittedAt && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Submitted: {new Date(assignment.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {assignment.submissionText && (
              <div>
                <label className="label text-xs mb-2">SUBMISSION TEXT</label>
                <div className="bg-slate-800/50 rounded-lg p-3 max-h-24 overflow-y-auto border border-slate-700/50">
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{assignment.submissionText}</p>
                </div>
              </div>
            )}

            {assignment.submittedFile && (
              <div>
                <label className="label text-xs mb-2">SUBMITTED FILE</label>
                <div className="flex gap-2">
                  {isPDF ? (
                    <>
                      <button onClick={() => setShowFilePreview(true)} 
                        className="flex-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-2 justify-center">
                        <Eye size={14} /> Preview PDF
                      </button>
                    </>
                  ) : (
                    <a href={fileUrl} target="_blank" rel="noreferrer"
                      className="flex-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-2 justify-center">
                      <FileText size={14} /> View File
                    </a>
                  )}
                  <a href={fileUrl} download
                    className="flex-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-2 justify-center">
                    <Download size={14} /> Download
                  </a>
                </div>
                <p className="text-xs text-slate-500 mt-2">📄 {assignment.submittedFile}</p>
              </div>
            )}

            <div className="border-t border-slate-700 pt-4 space-y-4">
              <div>
                <label className="label">Feedback *</label>
                <textarea className="input resize-none" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide constructive feedback..." />
              </div>
              <div>
                <label className="label">Marks (out of {assignment.maxMarks}) *</label>
                <div className="flex items-center gap-2">
                  <input className="input flex-1" type="number" min="0" max={assignment.maxMarks} value={marks} onChange={e => setMarks(e.target.value)} placeholder="0" />
                  <span className="text-xs text-slate-400">/ {assignment.maxMarks}</span>
                </div>
              </div>

              {marks && (
                <div className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-2">
                  Percentage: {Math.round((Number(marks) / assignment.maxMarks) * 100)}%
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => handleAction('rejected')} disabled={loading} className="btn-danger flex-1 flex items-center justify-center gap-2">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={() => handleAction('approved')} disabled={loading} className="btn-success flex-1 flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Approve
                </button>
              </div>

              {hasNext && (
                <button onClick={onNext} className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                  Next Submission <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showFilePreview && isPDF && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">PDF Preview</h2>
              <button onClick={() => setShowFilePreview(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950">
              <embed 
                src={fileUrl} 
                type="application/pdf" 
                width="100%" 
                height="100%" 
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <a href={fileUrl} target="_blank" rel="noreferrer"
                className="flex-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-2 justify-center">
                <Eye size={14} /> Open in New Tab
              </a>
              <a href={fileUrl} download
                className="flex-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-2 justify-center">
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const statusBadge = {
  allocated: 'badge-yellow',
  submitted: 'badge-blue',
  approved: 'badge-green',
  rejected: 'badge-red',
};

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllocate, setShowAllocate] = useState(false);
  const [viewAssignment, setViewAssignment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, allocated, submitted, approved, rejected

  console.log('AdminAssignments component mounted');

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments...');
      const res = await api.get('/tasks/assignments');
      console.log('Assignments fetched:', res.data);
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      toast.error('Failed to fetch'); 
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleApprove = async (id, status, feedback, marks) => {
    try {
      const res = await api.put(`/tasks/assignments/${id}/approve`, { status, adminFeedback: feedback, obtainedMarks: marks });
      setAssignments(assignments.map(a => a._id === id ? res.data : a));
      toast.success(`Assignment ${status}!`);
    } catch { toast.error('Failed to update'); }
  };

  // Filter assignments based on status
  const filteredAssignments = filterStatus === 'all' 
    ? assignments 
    : assignments.filter(a => a.status === filterStatus);

  // Get submitted assignments for navigation
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const currentIndex = viewAssignment ? submittedAssignments.findIndex(a => a._id === viewAssignment._id) : -1;

  const handleNextSubmission = () => {
    if (currentIndex < submittedAssignments.length - 1) {
      setViewAssignment(submittedAssignments[currentIndex + 1]);
    }
  };

  const handlePrevSubmission = () => {
    if (currentIndex > 0) {
      setViewAssignment(submittedAssignments[currentIndex - 1]);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-slate-400 mt-1">Manage and review student assignments</p>
        </div>
        <button onClick={() => setShowAllocate(true)} className="btn-primary flex items-center gap-2">
          <Shuffle size={16} /> Allocate Assignments
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: assignments.length, color: 'text-white' },
          { label: 'Pending', value: assignments.filter(a => a.status === 'allocated').length, color: 'text-amber-400' },
          { label: 'Submitted', value: assignments.filter(a => a.status === 'submitted').length, color: 'text-blue-400' },
          { label: 'Approved', value: assignments.filter(a => a.status === 'approved').length, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All', count: assignments.length },
          { value: 'allocated', label: 'Pending', count: assignments.filter(a => a.status === 'allocated').length },
          { value: 'submitted', label: 'Submitted', count: assignments.filter(a => a.status === 'submitted').length },
          { value: 'approved', label: 'Approved', count: assignments.filter(a => a.status === 'approved').length },
          { value: 'rejected', label: 'Rejected', count: assignments.filter(a => a.status === 'rejected').length },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Subject</th>
              <th>Allocated To</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Loading...</td></tr>
            ) : filteredAssignments.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">
                {filterStatus === 'submitted' ? 'No assignments submitted yet' : `No ${filterStatus === 'all' ? 'assignments' : filterStatus + ' assignments'}`}
              </td></tr>
            ) : filteredAssignments.map(a => (
              <tr key={a._id}>
                <td className="font-medium text-slate-200 max-w-[200px] truncate">{a.title}</td>
                <td className="text-slate-400 text-xs">{a.subject}</td>
                <td>
                  <p className="text-sm text-slate-200">{a.allocatedTo?.name}</p>
                  <p className="text-xs text-slate-500">{a.allocatedTo?.studentId}</p>
                </td>
                <td className="text-slate-400 text-xs">{new Date(a.dueDate).toLocaleDateString()}</td>
                <td><span className={statusBadge[a.status] || 'badge-yellow'}>{a.status}</span></td>
                <td>
                  {a.status === 'submitted' && (
                    <button onClick={() => setViewAssignment(a)}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1.5 rounded-lg">
                      <Eye size={13} /> Review
                    </button>
                  )}
                  {a.status === 'approved' && <span className="text-xs text-emerald-400">✓ Approved</span>}
                  {a.status === 'rejected' && <span className="text-xs text-red-400">✗ Rejected</span>}
                  {a.status === 'allocated' && <span className="text-xs text-slate-500">Awaiting submission</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} onSuccess={fetchAssignments} />}
      {viewAssignment && (
        <ViewSubmissionModal
          assignment={viewAssignment}
          onClose={() => setViewAssignment(null)}
          onApprove={handleApprove}
          allSubmitted={submittedAssignments}
          currentIndex={currentIndex}
          onNext={handleNextSubmission}
          onPrev={handlePrevSubmission}
        />
      )}
    </div>
  );
}
