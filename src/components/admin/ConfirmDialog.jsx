'use client';

import Modal from '@/components/ui/Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', body, confirmLabel = 'Delete' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-sm bg-rose-600 text-white hover:bg-rose-700">
            {confirmLabel}
          </button>
        </>
      }>
      <p className="text-sm leading-relaxed text-ink-500">{body || 'This cannot be undone.'}</p>
    </Modal>
  );
}
