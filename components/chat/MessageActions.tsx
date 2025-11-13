import { css } from '@emotion/react'
import { useState } from 'react'
import MessageExportMenu from './MessageExportMenu'
import type { ExportMessage } from '../../utils/chatExport'

interface MessageActionsProps {
  message: ExportMessage
  onRegenerate?: () => void
  onCopy?: () => void
  onFeedback?: (type: 'positive' | 'negative') => void
  showRegenerate?: boolean
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onRegenerate,
  onCopy,
  onFeedback,
  showRegenerate = false
}) => {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      if (onCopy) onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(feedback === type ? null : type)
    if (onFeedback) onFeedback(type)
  }

  return (
    <div css={css`
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;

      /* Show on parent hover */
      .message-container:hover & {
        opacity: 1;
      }
    `}>
      {/* Thumbs Up */}
      <button
        onClick={() => handleFeedback('positive')}
        title="Good response"
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background-color: transparent;
          border: none;
          border-radius: 6px;
          color: ${feedback === 'positive' ? '#6F2EFF' : '#878F9E'};
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #F9FBFF;
            color: #6F2EFF;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        `}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 7.5V14H2.5C2.22386 14 2 13.7761 2 13.5V8C2 7.72386 2.22386 7.5 2.5 7.5H4.5ZM4.5 7.5L7 2.5C7 2.5 7.5 2 8 2C8.5 2 9 2.5 9 3V6H12.5C13.3284 6 14 6.67157 14 7.5C14 7.69891 13.9612 7.88968 13.8904 8.06449L12.2071 12.6355C11.9662 13.2872 11.3447 13.7143 10.6464 13.7143H5.5C4.94772 13.7143 4.5 13.2666 4.5 12.7143V7.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={feedback === 'positive' ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      {/* Thumbs Down */}
      <button
        onClick={() => handleFeedback('negative')}
        title="Bad response"
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background-color: transparent;
          border: none;
          border-radius: 6px;
          color: ${feedback === 'negative' ? '#6F2EFF' : '#878F9E'};
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #F9FBFF;
            color: #6F2EFF;
          }

          svg {
            width: 16px;
            height: 16px;
          }
        `}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 8.5V2H13.5C13.7761 2 14 2.22386 14 2.5V8C14 8.27614 13.7761 8.5 13.5 8.5H11.5ZM11.5 8.5L9 13.5C9 13.5 8.5 14 8 14C7.5 14 7 13.5 7 13V10H3.5C2.67157 10 2 9.32843 2 8.5C2 8.30109 2.03878 8.11032 2.10961 7.93551L3.79289 3.36451C4.03382 2.71284 4.65527 2.28571 5.35355 2.28571H10.5C11.0523 2.28571 11.5 2.73343 11.5 3.28571V8.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={feedback === 'negative' ? 'currentColor' : 'none'}
          />
        </svg>
      </button>

      {/* Regenerate (only for assistant messages) */}
      {showRegenerate && onRegenerate && (
        <button
          onClick={onRegenerate}
          title="Regenerate response"
          css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            background-color: transparent;
            border: none;
            border-radius: 6px;
            color: #878F9E;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background-color: #F9FBFF;
              color: #6F2EFF;
            }

            svg {
              width: 16px;
              height: 16px;
            }
          `}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3C9.36954 3 10.6148 3.57946 11.5 4.5M11.5 4.5V2M11.5 4.5H9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Copy */}
      <button
        onClick={handleCopy}
        title={copied ? "Copied!" : "Copy message"}
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background-color: transparent;
          border: none;
          border-radius: 6px;
          color: ${copied ? '#10B981' : '#878F9E'};
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background-color: #F9FBFF;
            color: ${copied ? '#10B981' : '#6F2EFF'};
          }

          svg {
            width: 16px;
            height: 16px;
          }
        `}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M3 11V3C3 2.44772 3.44772 2 4 2H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Share (opens export menu) */}
      <MessageExportMenu message={message} />
    </div>
  )
}

export default MessageActions
