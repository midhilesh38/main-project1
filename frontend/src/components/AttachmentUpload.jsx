import React, { useRef } from 'react';
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENT_SIZE_BYTES,
  formatFileSize,
} from '../services/attachmentService';

/**
 * Controlled attachment picker + status display.
 * Validation and upload are driven by the parent (RaiseComplaintPage),
 * this component only handles file selection UI and rendering state.
 *
 * Props:
 *  - file: File | null           currently selected file
 *  - onFileSelect(file)          called when a new file is picked
 *  - onRemove()                  called when the user clears the file
 *  - validationError: string     client-side validation message (type/size)
 *  - uploadStatus: 'idle' | 'uploading' | 'success' | 'error'
 *  - uploadError: string         backend error message, shown when uploadStatus === 'error'
 *  - disabled: boolean           locks the picker (e.g. while submitting)
 */
export function AttachmentUpload({
  file,
  onFileSelect,
  onRemove,
  validationError,
  uploadStatus = 'idle',
  uploadError,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const handlePick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    // reset so selecting the same file again still fires onChange
    e.target.value = '';
    if (selected) onFileSelect(selected);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePick();
    }
  };

  const FileIcon = file?.type?.startsWith('image/') ? ImageIcon : FileText;
  const isUploading = uploadStatus === 'uploading';

  return (
    <div className="w-full space-y-1.5 text-left">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Attachment <span className="text-slate-400 normal-case font-medium">(optional)</span>
      </label>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        aria-label="Attach photo or document"
      />

      {!file ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handlePick}
          onKeyDown={handleKeyDown}
          aria-disabled={disabled}
          className={`w-full flex items-center justify-center gap-2 rounded-md border border-dashed text-sm py-3 px-4 transition-colors
            ${
              disabled
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-[#1a365d] cursor-pointer'
            }`}
        >
          <Paperclip className="w-4 h-4" />
          Attach photo or document
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
              <FileIcon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUploading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" aria-label="Uploading" />}
            {uploadStatus === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="Uploaded" />
            )}
            {uploadStatus === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-600" aria-label="Upload failed" />
            )}
            {!isUploading && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove file"
                aria-label="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {validationError ? (
        <p className="text-xs text-rose-600 font-medium">{validationError}</p>
      ) : uploadStatus === 'error' ? (
        <p className="text-xs text-rose-600 font-medium">
          {uploadError || 'Attachment failed to upload'}
        </p>
      ) : uploadStatus === 'success' ? (
        <p className="text-xs text-emerald-600 font-medium">Attachment uploaded successfully</p>
      ) : (
        <p className="text-xs text-slate-500">
          Supported: JPG, PNG, WEBP, PDF · Max {formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)}
        </p>
      )}
    </div>
  );
}
