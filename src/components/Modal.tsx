import React, { ReactNode, useEffect } from 'react';
import '../App.css';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        {title && <h2 className="modal__title">{title}</h2>}
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;


