import * as api from './api';

// NOTE: These constants (allowed types/extensions, max size) should be
// confirmed against Issue #38 (Secure Attachment Upload Backend) once its
// contract is available, and updated here if the backend differs.
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function formatFileSize(bytes) {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(fileName = '') {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  return `.${parts.pop().toLowerCase()}`;
}

/**
 * Validates a File before upload.
 * Returns an error message string, or null if the file is valid.
 */
export function validateAttachmentFile(file) {
  if (!file) return 'No file selected';

  const extension = getExtension(file.name);
  const typeOk =
    ALLOWED_ATTACHMENT_TYPES.includes(file.type) ||
    ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension);

  if (!typeOk) {
    return `Unsupported file type. Allowed types: ${ALLOWED_ATTACHMENT_EXTENSIONS.join(', ')}`;
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return `File is too large. Maximum size is ${formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)}`;
  }

  if (file.size === 0) {
    return 'File appears to be empty';
  }

  return null;
}

export const attachmentService = {
  async uploadAttachment(token, complaintId, file) {
    const validationError = validateAttachmentFile(file);
    if (validationError) {
      throw new Error(validationError);
    }
    return await api.uploadComplaintAttachment(token, complaintId, file);
  },
};
