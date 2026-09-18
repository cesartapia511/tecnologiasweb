import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar eliminación?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Sí, eliminar',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--upds-red-subtle)',
            color: 'var(--upds-red)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message}</p>
      </div>
      <div className="modal-footer" style={{ border: 'none', background: 'transparent' }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Eliminando...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
