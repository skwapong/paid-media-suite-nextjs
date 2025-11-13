import { css } from '@emotion/react'
import { useRef, useState } from 'react'
import { processFiles, formatFileSize, getFileIcon, type UploadedFile } from '../../utils/fileUpload'

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const { valid, invalid } = await processFiles(files, { maxFiles })

    if (invalid.length > 0) {
      // Show error notifications
      invalid.forEach(({ file, error }) => {
        console.error(`Failed to upload ${file.name}: ${error}`)
        // In a real app, you'd show a toast notification here
      })
    }

    if (valid.length > 0) {
      onFilesUploaded(valid)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    await handleFileSelect(files)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
        onChange={(e) => handleFileSelect(e.target.files)}
        css={css`
          display: none;
        `}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        css={css`
          display: flex;
          align-items: center;
          gap: 8px;
        `}
      >
        <button
          onClick={handleButtonClick}
          disabled={disabled}
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background-color: ${isDragging ? '#F3E8FF' : 'white'};
            border: 1px solid ${isDragging ? '#6F2EFF' : '#DCE1EA'};
            border-radius: 8px;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            opacity: ${disabled ? '0.5' : '1'};
            transition: all 0.2s;

            &:hover:not(:disabled) {
              background-color: #F9FBFF;
              border-color: #6F2EFF;

              svg {
                color: #6F2EFF;
              }
            }

            svg {
              width: 18px;
              height: 18px;
              color: ${isDragging ? '#6F2EFF' : '#878F9E'};
              transition: color 0.2s;
            }
          `}
        >
          <AttachIcon />
        </button>
      </div>
    </>
  )
}

interface FileAttachmentProps {
  file: UploadedFile
  onRemove: () => void
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/')

  return (
    <div css={css`
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: #F9FBFF;
      border: 1px solid #DCE1EA;
      border-radius: 8px;
      position: relative;
    `}>
      {/* Preview or Icon */}
      {isImage && file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          css={css`
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 4px;
          `}
        />
      ) : (
        <div css={css`
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background-color: white;
          border-radius: 4px;
        `}>
          {getFileIcon(file.type)}
        </div>
      )}

      {/* File Info */}
      <div css={css`
        flex: 1;
        min-width: 0;
      `}>
        <div css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #212327;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}>
          {file.name}
        </div>
        <div css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 12px;
          color: #878F9E;
          margin-top: 2px;
        `}>
          {formatFileSize(file.size)}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #FFE5E5;

            svg {
              color: #DC2626;
            }
          }

          svg {
            width: 14px;
            height: 14px;
            color: #878F9E;
            transition: color 0.2s;
          }
        `}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

const AttachIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.25 7.875L8.625 13.5C7.38236 14.7426 5.36764 14.7426 4.125 13.5C2.88236 12.2574 2.88236 10.2426 4.125 9L9.75 3.375C10.5784 2.54657 11.9216 2.54657 12.75 3.375C13.5784 4.20343 13.5784 5.54657 12.75 6.375L7.125 12C6.71079 12.4142 6.03921 12.4142 5.625 12C5.21079 11.5858 5.21079 10.9142 5.625 10.5L10.5 5.625"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default FileUpload
