import { css } from '@emotion/react'
import { useState, useRef, useEffect } from 'react'
import { exportConversation, type ExportMessage } from '../../utils/chatExport'

interface ExportMenuProps {
  messages: ExportMessage[]
  disabled?: boolean
}

const ExportMenu: React.FC<ExportMenuProps> = ({ messages, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = (format: 'txt' | 'md' | 'json' | 'html') => {
    exportConversation(messages, format, {
      includeTimestamps: true,
      includeActivities: true
    })
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} css={css`
      position: relative;
    `}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || messages.length === 0}
        css={css`
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: white;
          border: 1px solid #DCE1EA;
          border-radius: 8px;
          color: #212327;
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: ${disabled || messages.length === 0 ? 'not-allowed' : 'pointer'};
          opacity: ${disabled || messages.length === 0 ? '0.5' : '1'};
          transition: all 0.2s;

          &:hover:not(:disabled) {
            background-color: #F9FBFF;
            border-color: #6F2EFF;
            color: #6F2EFF;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        `}
      >
        <ExportIcon />
        Export
      </button>

      {isOpen && (
        <div css={css`
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background-color: white;
          border: 1px solid #DCE1EA;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 8px;
          min-width: 180px;
          z-index: 1000;
        `}>
          <div css={css`
            display: flex;
            flex-direction: column;
            gap: 4px;
          `}>
            <ExportOption
              icon="📝"
              label="Markdown (.md)"
              description="Rich text format"
              onClick={() => handleExport('md')}
            />
            <ExportOption
              icon="📄"
              label="Plain Text (.txt)"
              description="Simple text format"
              onClick={() => handleExport('txt')}
            />
            <ExportOption
              icon="🌐"
              label="HTML (.html)"
              description="Web page format"
              onClick={() => handleExport('html')}
            />
            <ExportOption
              icon="📊"
              label="JSON (.json)"
              description="Data format"
              onClick={() => handleExport('json')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface ExportOptionProps {
  icon: string
  label: string
  description: string
  onClick: () => void
}

const ExportOption: React.FC<ExportOptionProps> = ({ icon, label, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      css={css`
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background-color: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        width: 100%;

        &:hover {
          background-color: #F9FBFF;
        }
      `}
    >
      <span css={css`
        font-size: 20px;
        min-width: 20px;
      `}>
        {icon}
      </span>
      <div css={css`
        flex: 1;
      `}>
        <div css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #212327;
          margin-bottom: 2px;
        `}>
          {label}
        </div>
        <div css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 12px;
          color: #878F9E;
        `}>
          {description}
        </div>
      </div>
    </button>
  )
}

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V10M8 2L5 5M8 2L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export default ExportMenu
