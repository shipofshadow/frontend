import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

export const notyf = new Notyf({
    duration: 3500,
    ripple: true,
    dismissible: true,
    position: { x: 'right', y: 'top' },
    types: [
        {
            type: 'success',
            background: '#16a34a',
            icon: { className: 'fas fa-check-circle', tagName: 'i' }
        },
        {
            type: 'error',
            background: '#dc2626',
            icon: { className: 'fas fa-times-circle', tagName: 'i' }
        },
        {
            type: 'warning',
            background: '#f59e0b',
            icon: { className: 'fas fa-exclamation-triangle', tagName: 'i' }
        },
        {
            type: 'info',
            background: '#2563eb',
            icon: { className: 'fas fa-info-circle', tagName: 'i' }
        }
    ]
});
