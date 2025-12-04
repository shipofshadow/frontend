import { useState, useEffect } from 'react';
import {
    Download,
    Upload,
    Trash2,
    Database,
    HardDrive,
    Clock,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Info,
    FileText,
    Calendar,
    Package,
    Plus,
    Search,
    Server,
    ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../config.ts';

const BackupRestore = () => {
    // --- State & Logic (Unchanged) ---
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<any | null>(null);
    const { token } = useAuth();

    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        includeFiles: true,
    });

    const [restoreForm, setRestoreForm] = useState({
        restoreFiles: true,
    });

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'danger' | 'info';
    } | null>(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const showNotification = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/backup/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setBackups(data.backups || []);
            } else {
                showNotification(data.error || 'Failed to fetch backups', 'danger');
            }
        } catch (err: any) {
            showNotification('Error connecting to server', 'danger');
            console.error('Error fetching backups:', err);
        }
        setLoading(false);
    };

    const handleCreateBackup = async () => {
        const { isConfirmed: allowAutoname } = await Swal.fire({
            title: 'No name provided',
            text: 'Use auto-generated name?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        });

        if (!createForm.name.trim() && !allowAutoname) {
            return;
        }

        setCreating(true);

        try {
            const backupName =
                createForm.name.trim() ||
                `backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;

            const res = await fetch(`${API_BASE_URL}/api/backup/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: backupName,
                    description: createForm.description,
                    include_files: createForm.includeFiles,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showNotification('Backup created successfully!', 'success');
                setShowCreateModal(false);
                setCreateForm({ name: '', description: '', includeFiles: true });
                fetchBackups();
            } else {
                showNotification(`Error: ${data.error}`, 'danger');
            }
        } catch (err: any) {
            showNotification(`Error creating backup: ${err.message}`, 'danger');
        }

        setCreating(false);
    };

    const handleRestore = async () => {
        if (!selectedBackup) return;

        const firstConfirm = await Swal.fire({
            title: 'Critical Warning',
            html:
                `You are about to restore backup: <b>"${selectedBackup.name}"</b><br/><br/>` +
                `This will:<br/>` +
                `• Replace ALL current database data<br/>` +
                `${restoreForm.restoreFiles ? '• Replace ALL uploaded files<br/>' : ''}` +
                `• This action CANNOT be undone<br/><br/>` +
                `Are you absolutely sure you want to proceed?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });

        if (!firstConfirm.isConfirmed) return;

        const doubleConfirm = await Swal.fire({
            title: 'Final Confirmation',
            text: 'Type YES in the next prompt to confirm restoration.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });

        if (!doubleConfirm.isConfirmed) return;

        const finalConfirm = await Swal.fire({
            title: 'Type YES to confirm',
            input: 'text',
            inputLabel: 'Type "YES" (in capitals) to confirm backup restoration:',
            inputPlaceholder: 'YES',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            preConfirm: (value) => {
                if (value !== 'YES') {
                    return 'You must type YES exactly to confirm.';
                }
                return value;
            },
        });

        if (!finalConfirm.isConfirmed || finalConfirm.value !== 'YES') {
            showNotification('Restore cancelled - confirmation text did not match', 'info');
            return;
        }

        setRestoring(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/backup/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    filename: selectedBackup.filename,
                    restore_files: restoreForm.restoreFiles,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showNotification('Backup restored successfully! Refreshing page...', 'success');
                setShowRestoreModal(false);
                setSelectedBackup(null);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                showNotification(`Restore failed: ${data.error}`, 'danger');
            }
        } catch (err: any) {
            showNotification(`Error restoring backup: ${err.message}`, 'danger');
        }

        setRestoring(false);
    };

    const handleDownload = async (filename: string) => {
        try {
            showNotification('Preparing download...', 'info');

            const res = await fetch(`${API_BASE_URL}/api/backup/download/${filename}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error('Download failed');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showNotification('Download started!', 'success');
        } catch (err: any) {
            showNotification(`Download failed: ${err.message}`, 'danger');
        }
    };

    const handleDelete = async (filename: string, backupName: string) => {
        const result = await Swal.fire({
            title: 'Delete Backup',
            html:
                `Are you sure you want to delete "<b>${backupName}</b>"?<br/><br/>` +
                'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
        });

        if (!result.isConfirmed) return;

        setDeleting(filename);

        try {
            const res = await fetch(`${API_BASE_URL}/api/backup/delete/${filename}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showNotification('Backup deleted successfully', 'success');
                await fetchBackups();
            } else {
                showNotification(`Error: ${data.error || 'Failed to delete backup'}`, 'danger');
            }
        } catch (err: any) {
            showNotification(`Error deleting backup: ${err.message}`, 'danger');
        } finally {
            setDeleting(null);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getBackupStats = () => {
        const totalSize = backups.reduce((sum, b: any) => sum + (b.size || 0), 0);
        const withFiles = backups.filter((b: any) => b.include_files).length;
        const latest = backups.length > 0 ? backups[0] : null;
        return { totalSize, withFiles, latest };
    };

    const stats = getBackupStats();

    return (
        <div className="min-vh-100 bg-gray-50 text-dark">
            <style>{`
                :root {
                    --primary-color: #2563eb;
                    --primary-hover: #1d4ed8;
                    --bg-page: #f8fafc;
                    --border-color: #e2e8f0;
                    --text-secondary: #64748b;
                    --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    --card-hover-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }

                body {
                    background-color: var(--bg-page);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                }
                
                /* Utils */
                .bg-gray-50 { background-color: var(--bg-page) !important; }
                .text-secondary-custom { color: var(--text-secondary) !important; }
                .border-subtle { border-color: var(--border-color) !important; }
                .cursor-pointer { cursor: pointer; }

                /* Cards */
                .custom-card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
                    transition: all 0.3s ease;
                }
                .custom-card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--card-hover-shadow);
                }

                /* Table */
                .custom-table thead th {
                    background-color: #f8fafc;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    padding: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .custom-table tbody td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }
                .custom-table tbody tr:hover {
                    background-color: #f8fafc;
                }

                /* Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

                /* Animations */
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                /* Modal */
                .modal-backdrop.show { opacity: 0.6; background-color: #0f172a; }
                .modal-content { border: none; border-radius: 16px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
                .modal-header { border-bottom: 1px solid var(--border-color); padding: 1.5rem; }
                .modal-body { padding: 1.5rem; }
                .modal-footer { border-top: 1px solid var(--border-color); padding: 1.25rem 1.5rem; }
            `}</style>

            {/* Notification Toast */}
            {notification && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div className={`toast show align-items-center text-white bg-${notification.type} border-0 shadow-lg`} role="alert">
                        <div className="d-flex">
                            <div className="toast-body d-flex align-items-center">
                                {notification.type === 'success' && <CheckCircle size={18} className="me-2" />}
                                {notification.type === 'danger' && <AlertTriangle size={18} className="me-2" />}
                                {notification.message}
                            </div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setNotification(null)}></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Header */}
            <header className="bg-white border-bottom sticky-top shadow-sm z-20">
                <div className="container-fluid px-4">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
                                <Server size={24} />
                            </div>
                            <div>
                                <h1 className="h5 fw-bold text-dark mb-0">System Backup & Restore</h1>
                                <p className="text-secondary-custom small mb-0">Database and file management</p>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2 btn-sm px-3"
                                onClick={fetchBackups}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                                <span className="d-none d-sm-inline">Refresh</span>
                            </button>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2 btn-sm px-3 shadow-sm"
                                onClick={() => setShowCreateModal(true)}
                                disabled={creating}
                            >
                                <Plus size={16} />
                                <span>Create Backup</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container-fluid px-4 py-4">
                {/* Stats Dashboard */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="custom-card p-3 h-100 fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-blue-50 p-3 rounded-3 text-primary">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark">{backups.length}</h3>
                                    <div className="text-secondary-custom small">Total Snapshots</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="custom-card p-3 h-100 fade-in-up" style={{ animationDelay: '50ms' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-green-50 p-3 rounded-3 text-success">
                                    <HardDrive size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark">{formatBytes(stats.totalSize)}</h3>
                                    <div className="text-secondary-custom small">Storage Used</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="custom-card p-3 h-100 fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-purple-50 p-3 rounded-3 text-info">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark">{stats.withFiles}</h3>
                                    <div className="text-secondary-custom small">Include Files</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="custom-card p-3 h-100 fade-in-up" style={{ animationDelay: '150ms' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-orange-50 p-3 rounded-3 text-warning">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0 text-dark" style={{fontSize: '1.1rem'}}>
                                        {stats.latest ? formatDate(stats.latest.created_at) : 'N/A'}
                                    </h3>
                                    <div className="text-secondary-custom small">Last Backup</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="row g-4">
                    <div className="col-lg-12">

                        {/* Backups Table */}
                        <div className="custom-card overflow-hidden fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="card-header bg-white py-3 border-bottom d-flex align-items-center justify-content-between p-2">
                                <h5 className="card-title mb-0 fw-bold d-flex align-items-center gap-2">
                                    <Database size={18} className="text-primary" />
                                    Available Backups
                                </h5>
                                <div className="text-secondary-custom small">
                                    {backups.length} items
                                </div>
                            </div>

                            <div className="table-responsive custom-scrollbar" style={{ maxHeight: '600px' }}>
                                <table className="table mb-0 custom-table w-100">
                                    <thead>
                                    <tr>
                                        <th>Backup Name</th>
                                        <th>Description</th>
                                        <th>Created</th>
                                        <th>Size</th>
                                        <th className="text-center">Contents</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5">
                                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                                <p className="text-muted small">Retrieving backups...</p>
                                            </td>
                                        </tr>
                                    ) : backups.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5">
                                                <div className="bg-light p-4 rounded-circle d-inline-block mb-3">
                                                    <Search size={32} className="text-secondary-custom opacity-50" />
                                                </div>
                                                <h6 className="fw-bold">No Backups Found</h6>
                                                <p className="text-secondary-custom small mb-3">System is at risk without backups.</p>
                                                <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)}>
                                                    Create First Backup
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.map((backup: any, index: number) => (
                                            <tr key={backup.filename}>
                                                <td>
                                                    <div className="d-flex flex-column">
                                                            <span className="fw-semibold text-dark d-flex align-items-center gap-2">
                                                                {backup.name}
                                                                {index === 0 && (
                                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill" style={{fontSize: '0.65rem'}}>Latest</span>
                                                                )}
                                                            </span>
                                                        <span className="small text-secondary-custom font-monospace">{backup.filename}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                        <span className="text-secondary-custom small">
                                                            {backup.description || <em className="text-muted opacity-50">No description</em>}
                                                        </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center text-dark small fw-medium">
                                                        <Calendar size={14} className="me-2 text-secondary-custom" />
                                                        {formatDate(backup.created_at)}
                                                    </div>
                                                </td>
                                                <td>
                                                        <span className="badge bg-light text-dark border fw-normal">
                                                            {formatBytes(backup.size)}
                                                        </span>
                                                </td>
                                                <td className="text-center">
                                                    {backup.include_files ? (
                                                        <span className="badge bg-blue-50 text-primary border border-primary border-opacity-10 rounded-pill">
                                                                DB + Files
                                                            </span>
                                                    ) : (
                                                        <span className="badge bg-gray-100 text-secondary-custom border rounded-pill">
                                                                DB Only
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-sm btn-white border shadow-sm text-secondary-custom hover-text-primary"
                                                            onClick={() => handleDownload(backup.filename)}
                                                            title="Download"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-white border shadow-sm text-secondary-custom hover-text-warning"
                                                            onClick={() => {
                                                                setSelectedBackup(backup);
                                                                setRestoreForm({ restoreFiles: backup.include_files });
                                                                setShowRestoreModal(true);
                                                            }}
                                                            title="Restore"
                                                        >
                                                            <Upload size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-white border shadow-sm text-secondary-custom hover-text-danger"
                                                            onClick={() => handleDelete(backup.filename, backup.name)}
                                                            disabled={deleting === backup.filename}
                                                            title="Delete"
                                                        >
                                                            {deleting === backup.filename ? (
                                                                <span className="spinner-border spinner-border-sm" style={{width: '1rem', height: '1rem'}}></span>
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}

            {/* Create Backup Modal */}
            {showCreateModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-white">
                                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                        <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle">
                                            <Database size={20} />
                                        </div>
                                        Create New Backup
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} disabled={creating}></button>
                                </div>
                                <div className="modal-body bg-gray-50">
                                    <div className="custom-card p-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-secondary-custom text-uppercase">Backup Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={createForm.name}
                                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                                placeholder="Auto-generated if empty..."
                                                disabled={creating}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-secondary-custom text-uppercase">Description</label>
                                            <textarea
                                                className="form-control"
                                                rows={2}
                                                value={createForm.description}
                                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                                placeholder="Optional notes..."
                                                disabled={creating}
                                            />
                                        </div>

                                        <div className="form-check custom-card p-3 d-flex align-items-start gap-2 m-0 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-check-input mt-1"
                                                id="includeFiles"
                                                checked={createForm.includeFiles}
                                                onChange={(e) => setCreateForm({ ...createForm, includeFiles: e.target.checked })}
                                                disabled={creating}
                                            />
                                            <label className="form-check-label w-100 cursor-pointer" htmlFor="includeFiles">
                                                <span className="d-block fw-bold text-dark">Include Uploaded Files</span>
                                                <span className="d-block small text-secondary-custom">Backs up ITRs, grades, and documents.</span>
                                            </label>
                                        </div>

                                        {!createForm.includeFiles && (
                                            <div className="mt-3 text-warning small d-flex align-items-center gap-2">
                                                <AlertTriangle size={14} />
                                                <span>Database only. Files will be excluded.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer bg-white">
                                    <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)} disabled={creating}>Cancel</button>
                                    <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={handleCreateBackup} disabled={creating}>
                                        {creating && <span className="spinner-border spinner-border-sm"></span>}
                                        Start Backup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Restore Modal */}
            {showRestoreModal && selectedBackup && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-white border-bottom-0 pb-0">
                                    <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                                        <ShieldAlert size={24} />
                                        System Restore
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowRestoreModal(false)} disabled={restoring}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger mb-4">
                                        <h6 className="fw-bold d-flex align-items-center gap-2 mb-2">
                                            <AlertTriangle size={18} />
                                            Critical Action
                                        </h6>
                                        <p className="small mb-0">
                                            Restoring <strong>{selectedBackup.name}</strong> will overwrite the current database. All data created after this backup will be lost permanently.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-3 p-3 mb-3 border border-subtle">
                                        <div className="row g-2 text-sm">
                                            <div className="col-4 text-secondary-custom">Backup Date:</div>
                                            <div className="col-8 fw-medium text-dark">{formatDate(selectedBackup.created_at)}</div>
                                            <div className="col-4 text-secondary-custom">Data Size:</div>
                                            <div className="col-8 fw-medium text-dark">{formatBytes(selectedBackup.size)}</div>
                                        </div>
                                    </div>

                                    {selectedBackup.include_files && (
                                        <div className="form-check custom-card p-3 d-flex align-items-center gap-2 m-0 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="form-check-input m-0"
                                                id="restoreFiles"
                                                checked={restoreForm.restoreFiles}
                                                onChange={(e) => setRestoreForm({ restoreFiles: e.target.checked })}
                                                disabled={restoring}
                                            />
                                            <label className="form-check-label cursor-pointer ms-2" htmlFor="restoreFiles">
                                                <span className="d-block fw-bold text-dark">Restore File Uploads</span>
                                                <span className="d-block small text-secondary-custom">Overwrite current files with backup versions</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-white border" onClick={() => setShowRestoreModal(false)} disabled={restoring}>Cancel</button>
                                    <button type="button" className="btn btn-danger d-flex align-items-center gap-2 shadow-sm" onClick={handleRestore} disabled={restoring}>
                                        {restoring ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm"></span>
                                                Restoring...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                Confirm Restore
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BackupRestore;