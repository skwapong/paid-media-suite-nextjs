/**
 * File Upload Utilities
 * Handles file uploads and processing for chat attachments
 */

export interface UploadedFile {
  id: string
  file: File              // Keep reference to original File object for reading
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  preview?: string
}

export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  maxFiles?: number
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } => {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE
  const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(maxSize)}. Please upload a smaller file.`
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. Allowed types: ${getAllowedTypesLabel(allowedTypes)}`
    }
  }

  return { valid: true }
}

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get human-readable label for allowed file types
 */
const getAllowedTypesLabel = (types: string[]): string => {
  const labels: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'application/pdf': 'PDF',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
  }

  return types.map(type => labels[type] || type).join(', ')
}

/**
 * Create preview for image files
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Read text file content
 */
export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Process uploaded file
 */
export const processFile = async (file: File): Promise<UploadedFile> => {
  const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Create preview for images
  let preview: string | undefined
  if (file.type.startsWith('image/')) {
    try {
      preview = await createImagePreview(file)
    } catch (error) {
      console.warn('Failed to create image preview:', error)
    }
  }

  // Create object URL for the file
  const url = URL.createObjectURL(file)

  return {
    id,
    file,                // Keep reference to original File object
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    uploadedAt: new Date(),
    preview
  }
}

/**
 * Process multiple files
 */
export const processFiles = async (
  files: FileList | File[],
  options: FileValidationOptions = {}
): Promise<{
  valid: UploadedFile[];
  invalid: { file: File; error: string }[]
}> => {
  const maxFiles = options.maxFiles || 5
  const filesArray = Array.from(files).slice(0, maxFiles)

  const valid: UploadedFile[] = []
  const invalid: { file: File; error: string }[] = []

  for (const file of filesArray) {
    const validation = validateFile(file, options)

    if (validation.valid) {
      try {
        const processedFile = await processFile(file)
        valid.push(processedFile)
      } catch (error) {
        invalid.push({
          file,
          error: error instanceof Error ? error.message : 'Failed to process file'
        })
      }
    } else {
      invalid.push({
        file,
        error: validation.error || 'Invalid file'
      })
    }
  }

  return { valid, invalid }
}

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Get file icon based on type
 */
export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎥'
  if (type.startsWith('audio/')) return '🎵'
  if (type === 'application/pdf') return '📄'
  if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
  if (type.includes('document') || type.includes('word')) return '📝'
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊'
  if (type === 'text/plain') return '📃'
  if (type === 'text/csv') return '📋'
  return '📎'
}

/**
 * Clean up file URLs to prevent memory leaks
 */
export const cleanupFileUrls = (files: UploadedFile[]): void => {
  files.forEach(file => {
    if (file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
}
