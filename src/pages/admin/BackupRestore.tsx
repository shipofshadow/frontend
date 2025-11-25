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
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../config.ts';

const BackupRestore = () => {
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
        <div className="container-fluid p-4">
            {notification && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div
                        className={`alert alert-${notification.type} alert-dismissible fade show shadow-lg`}
                        role="alert"
                    >
                        <strong>{notification.message}</strong>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setNotification(null)}
                        ></button>
                    </div>
                </div>
            )}

            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-2 d-flex align-items-center">
                                <Database className="me-2 text-primary" size={36} />
                                Backup &amp; Restore
                            </h2>
                            <p className="text-muted mb-0">
                                Create, manage, and restore system backups with complete database and
                                file protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Total Backups</p>
                                    <h3 className="mb-0">{backups.length}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 p-3 rounded">
                                    <Package className="text-primary" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Total Size</p>
                                    <h3 className="mb-0">{formatBytes(stats.totalSize)}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded">
                                    <HardDrive className="text-success" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">With Files</p>
                                    <h3 className="mb-0">{stats.withFiles}</h3>
                                </div>
                                <div className="bg-info bg-opacity-10 p-3 rounded">
                                    <FileText className="text-info" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">Latest Backup</p>
                                    <h6 className="mb-0 small">
                                        {stats.latest ? formatDate(stats.latest.created_at) : 'None'}
                                    </h6>
                                </div>
                                <div className="bg-warning bg-opacity-10 p-3 rounded">
                                    <Calendar className="text-warning" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">Quick Actions</h5>
                                <p className="text-muted mb-0 small">
                                    Create a new backup or refresh the list
                                </p>
                            </div>
                            <div>
                                <button
                                    className="btn btn-primary me-2 shadow-sm"
                                    onClick={() => setShowCreateModal(true)}
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Database className="me-2" size={18} />
                                            Create New Backup
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn btn-outline-secondary shadow-sm"
                                    onClick={fetchBackups}
                                    disabled={loading}
                                >
                                    <RefreshCw
                                        className={`me-2 ${loading ? 'spin' : ''}`}
                                        size={18}
                                    />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col">
                    <div className="alert alert-info border-0 shadow-sm d-flex align-items-start">
                        <Info className="me-2 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <strong>Backup Best Practices:</strong>
                            <ul className="mb-0 mt-1 small ps-3">
                                <li>Create backups regularly before major changes</li>
                                <li>Download important backups to external storage</li>
                                <li>Test restore functionality periodically</li>
                                <li>Keep at least 3 recent backups for safety</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0 d-flex align-items-center">
                                <Package className="me-2 text-primary" size={20} />
                                Available Backups ({backups.length})
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div
                                        className="spinner-border text-primary mb-3"
                                        role="status"
                                    >
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="text-muted">Loading backups...</p>
                                </div>
                            ) : backups.length === 0 ? (
                                <div className="text-center py-5 px-4">
                                    <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                                        <Database
                                            size={48}
                                            className="text-muted opacity-50"
                                        />
                                    </div>
                                    <h5>No Backups Found</h5>
                                    <p className="text-muted">
                                        Create your first backup to get started with data
                                        protection.
                                    </p>
                                    <button
                                        className="btn btn-primary mt-2"
                                        onClick={() => setShowCreateModal(true)}
                                    >
                                        <Database className="me-2" size={18} />
                                        Create First Backup
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light">
                                        <tr>
                                            <th className="border-0">Name</th>
                                            <th className="border-0">Description</th>
                                            <th className="border-0">Created</th>
                                            <th className="border-0">Size</th>
                                            <th className="border-0 text-center">Files</th>
                                            <th className="border-0 text-center">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {backups.map((backup: any, index: number) => (
                                            <tr
                                                key={backup.filename}
                                                className={index === 0 ? 'table-active' : ''}
                                            >
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Database
                                                            size={16}
                                                            className="me-2 text-primary"
                                                        />
                                                        <div>
                                                            <strong>{backup.name}</strong>
                                                            {index === 0 && (
                                                                <span className="badge bg-success ms-2 small">
                                                                        Latest
                                                                    </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted small">
                                                    {backup.description || (
                                                        <em className="text-muted">
                                                            No description
                                                        </em>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <Clock
                                                            size={14}
                                                            className="me-1"
                                                        />
                                                        {formatDate(backup.created_at)}
                                                    </div>
                                                </td>
                                                <td>
                                                        <span className="badge bg-secondary">
                                                            {formatBytes(backup.size)}
                                                        </span>
                                                </td>
                                                <td className="text-center">
                                                    {backup.include_files ? (
                                                        <span className="badge bg-success">
                                                                <CheckCircle
                                                                    size={12}
                                                                    className="me-1"
                                                                />
                                                                Yes
                                                            </span>
                                                    ) : (
                                                        <span className="badge bg-secondary">
                                                                Database Only
                                                            </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group btn-group-sm shadow-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() =>
                                                                handleDownload(
                                                                    backup.filename
                                                                )
                                                            }
                                                            title="Download Backup"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-warning"
                                                            onClick={() => {
                                                                setSelectedBackup(backup);
                                                                setRestoreForm({
                                                                    restoreFiles:
                                                                    backup.include_files,
                                                                });
                                                                setShowRestoreModal(true);
                                                            }}
                                                            title="Restore Backup"
                                                        >
                                                            <Upload size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    backup.filename,
                                                                    backup.name
                                                                )
                                                            }
                                                            title="Delete Backup"
                                                            disabled={
                                                                deleting === backup.filename
                                                            }
                                                        >
                                                            {deleting ===
                                                            backup.filename ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <Database className="me-2" size={24} />
                                    Create New Backup
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        Backup Name{' '}
                                        <span className="text-muted fw-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={createForm.name}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., before_major_update"
                                        disabled={creating}
                                    />
                                    <small className="text-muted">
                                        Leave empty for auto-generated timestamp name
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        Description{' '}
                                        <span className="text-muted fw-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={createForm.description}
                                        onChange={(e) =>
                                            setCreateForm({
                                                ...createForm,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Brief description of this backup (e.g., Before semester rollover, Pre-migration backup)"
                                        disabled={creating}
                                    />
                                </div>

                                <div className="card bg-light border-0">
                                    <div className="card-body">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="includeFiles"
                                                checked={createForm.includeFiles}
                                                onChange={(e) =>
                                                    setCreateForm({
                                                        ...createForm,
                                                        includeFiles: e.target.checked,
                                                    })
                                                }
                                                disabled={creating}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="includeFiles"
                                            >
                                                <div className="d-flex align-items-center">
                                                    <HardDrive
                                                        size={18}
                                                        className="me-2 text-primary"
                                                    />
                                                    <div>
                                                        <strong>Include Uploaded Files</strong>
                                                        <div className="small text-muted">
                                                            Backup ITR documents, grade files, and
                                                            other uploads
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {!createForm.includeFiles && (
                                    <div className="alert alert-warning mt-3 mb-0 small">
                                        <AlertTriangle size={16} className="me-2" />
                                        Only database will be backed up. Uploaded files will not be
                                        included.
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateBackup}
                                    disabled={creating}
                                >
                                    {creating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Creating Backup...
                                        </>
                                    ) : (
                                        <>
                                            <Database className="me-2" size={18} />
                                            Create Backup
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRestoreModal && selectedBackup && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title d-flex align-items-center">
                                    <AlertTriangle className="me-2" size={24} />
                                    Restore Backup - Critical Action
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowRestoreModal(false)}
                                    disabled={restoring}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-danger border-0 d-flex align-items-start mb-4">
                                    <AlertTriangle className="me-2 mt-1 flex-shrink-0" size={24} />
                                    <div>
                                        <strong className="d-block mb-2">
                                            Critical Warning
                                        </strong>
                                        <p className="mb-2">This action will:</p>
                                        <ul className="mb-2 ps-3">
                                            <li>Replace ALL current database data</li>
                                            {restoreForm.restoreFiles && (
                                                <li>Replace ALL uploaded files</li>
                                            )}
                                            <li>
                                                <strong>Cannot be undone</strong>
                                            </li>
                                        </ul>
                                        <small>
                                            Current data will be lost unless you have another
                                            backup.
                                        </small>
                                    </div>
                                </div>

                                <div className="card bg-light border-0 mb-3">
                                    <div className="card-body">
                                        <h6 className="mb-3">Backup Details</h6>
                                        <table className="table table-sm table-borderless mb-0">
                                            <tbody>
                                            <tr>
                                                <td className="text-muted">Name:</td>
                                                <td>
                                                    <strong>{selectedBackup.name}</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Created:</td>
                                                <td>{formatDate(selectedBackup.created_at)}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Size:</td>
                                                <td>
                                                        <span className="badge bg-secondary">
                                                            {formatBytes(selectedBackup.size)}
                                                        </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted">Database:</td>
                                                <td>
                                                    <code>{selectedBackup.database}</code>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {selectedBackup.include_files && (
                                    <div className="card border-0">
                                        <div className="card-body">
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="restoreFiles"
                                                    checked={restoreForm.restoreFiles}
                                                    onChange={(e) =>
                                                        setRestoreForm({
                                                            restoreFiles: e.target.checked,
                                                        })
                                                    }
                                                    disabled={restoring}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="restoreFiles"
                                                >
                                                    <HardDrive size={16} className="me-2" />
                                                    <strong>Also restore uploaded files</strong>
                                                    <div className="small text-muted mt-1">
                                                        Restore ITR documents, grade files, and other
                                                        uploads
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowRestoreModal(false)}
                                    disabled={restoring}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleRestore}
                                    disabled={restoring}
                                >
                                    {restoring ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Restoring...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="me-2" size={18} />
                                            Restore Backup
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .table-hover tbody tr:hover {
                    background-color: rgba(0, 0, 0, 0.02);
                }
                
                .btn-group-sm .btn {
                    padding: 0.25rem 0.5rem;
                }
                
                .card {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05);
                }
                
                .modal {
                    backdrop-filter: blur(4px);
                }
                
                .alert {
                    animation: slideDown 0.3s ease-out;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .badge {
                    font-weight: 500;
                    padding: 0.35em 0.65em;
                }
                
                .form-check-input:checked {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }
                
                .btn:disabled {
                    cursor: not-allowed;
                }
                
                .table thead th {
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.5px;
                    color: #6c757d;
                }
                
                .modal-content {
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                
                .modal-header {
                    border-bottom: none;
                }
                
                .modal-footer {
                    border-top: 1px solid rgba(0,0,0,0.1);
                }
                
                code {
                    background-color: #f8f9fa;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    color: #d63384;
                }
            `}</style>
        </div>
    );
};

export default BackupRestore;
