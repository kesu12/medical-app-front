import React, { useState, useRef } from 'react';
import Modal from './Modal';
import '../App.css';

type AvatarEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
};

function AvatarEditModal({ open, onClose, onSave, currentAvatarUrl }: AvatarEditModalProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function compressImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Failed to read compressed image'));
              reader.readAsDataURL(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      // Compress and optimize the image
      const compressedDataUrl = await compressImage(selectedFile, 800, 800, 0.8);
      setPreview(compressedDataUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process image');
      setFile(null);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value);
    setError(null);
    if (e.target.value) {
      setPreview(e.target.value);
    } else {
      setPreview(null);
    }
  }

  function handleSave() {
    if (mode === 'file') {
      if (!file || !preview) {
        setError('Please select an image file');
        return;
      }
      onSave(preview);
    } else {
      if (!url.trim()) {
        setError('Please enter an image URL');
        return;
      }
      // Validate URL
      try {
        new URL(url);
        onSave(url.trim());
      } catch {
        setError('Please enter a valid URL');
        return;
      }
    }
    handleClose();
  }

  function handleClose() {
    setMode('file');
    setUrl('');
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  }

  return (
    <Modal open={open} title="Change Avatar" onClose={handleClose}>
      <div className="avatar-edit">
        <div className="avatar-edit__tabs">
          <button
            className={`avatar-edit__tab ${mode === 'file' ? 'avatar-edit__tab--active' : ''}`}
            onClick={() => setMode('file')}
          >
            Upload from Computer
          </button>
          <button
            className={`avatar-edit__tab ${mode === 'url' ? 'avatar-edit__tab--active' : ''}`}
            onClick={() => setMode('url')}
          >
            Enter URL
          </button>
        </div>

        <div className="avatar-edit__content">
          {mode === 'file' ? (
            <div className="avatar-edit__file-section">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="avatar-edit__file-input"
                id="avatar-file-input"
              />
              <label htmlFor="avatar-file-input" className="btn btn--ghost avatar-edit__file-label">
                Choose File
              </label>
              {file && (
                <div className="avatar-edit__file-info">
                  <span>{file.name}</span>
                  <span className="avatar-edit__file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="avatar-edit__url-section">
              <input
                type="url"
                className="form__input"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          {preview && (
            <div className="avatar-edit__preview">
              <img src={preview} alt="Preview" className="avatar-edit__preview-img" />
            </div>
          )}

          {error && <div className="form__error">{error}</div>}

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={!preview}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AvatarEditModal;

