import { css } from '@emotion/react'
import { useState } from 'react'

interface ToolResponseProps {
  toolCall: {
    id?: string
    function_name?: string
    function_arguments?: string | any
    output?: any
    status?: string
  }
  success?: boolean
}

const ToolResponseRenderer: React.FC<ToolResponseProps> = ({ toolCall, success = true }) => {
  const [showArguments, setShowArguments] = useState(false)
  const [showResponse, setShowResponse] = useState(false)

  // Determine if this tool call was successful
  const isSuccess = success && toolCall.status !== 'ERROR' && toolCall.status !== 'FAILED'

  // Check if this is an output tool or internal tool
  const isOutputTool = !!toolCall.output

  // Format arguments for display
  const formatArguments = () => {
    try {
      if (typeof toolCall.function_arguments === 'string') {
        const parsed = JSON.parse(toolCall.function_arguments)
        return JSON.stringify(parsed, null, 2)
      }
      return JSON.stringify(toolCall.function_arguments, null, 2)
    } catch {
      return typeof toolCall.function_arguments === 'string'
        ? toolCall.function_arguments
        : JSON.stringify(toolCall.function_arguments, null, 2)
    }
  }

  // Format output/response for display
  const formatOutput = () => {
    try {
      if (typeof toolCall.output === 'string') {
        const parsed = JSON.parse(toolCall.output)
        return JSON.stringify(parsed, null, 2)
      }
      return JSON.stringify(toolCall.output, null, 2)
    } catch {
      return typeof toolCall.output === 'string'
        ? toolCall.output
        : JSON.stringify(toolCall.output, null, 2)
    }
  }

  return (
    <div css={css`
      background-color: ${isOutputTool ? '#FEF3C7' : '#E0F2FE'};
      border: 1px solid ${isOutputTool ? '#FCD34D' : '#BAE6FD'};
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
    `}>
      {/* Header */}
      <div css={css`
        display: flex;
        align-items: center;
        gap: 8px;
        color: ${isOutputTool ? '#92400E' : '#0369A1'};
        margin-bottom: 8px;
      `}>
        {/* Expand icon */}
        <button
          onClick={() => setShowArguments(!showArguments)}
          css={css`
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            color: inherit;
            transition: transform 0.2s;
            transform: rotate(${showArguments ? '90deg' : '0deg'});
          `}
        >
          <ChevronIcon />
        </button>

        {/* Tool icon */}
        <ToolIcon />

        {/* Tool name */}
        <span css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 600;
          font-size: 12px;
          color: ${!isSuccess ? '#DC2626' : 'inherit'};
        `}>
          {isOutputTool ? 'Calling' : 'Internal Tool'}: {toolCall.function_name}
        </span>

        {/* Status badge */}
        <span css={css`
          background-color: ${isSuccess ? '#D1FAE5' : '#FEE2E2'};
          color: ${isSuccess ? '#065F46' : '#991B1B'};
          border: 1px solid ${isSuccess ? '#6EE7B7' : '#FCA5A5'};
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'Figtree', sans-serif;
          font-weight: 600;
          font-size: 10px;
        `}>
          {isSuccess ? 'SUCCESS' : 'ERROR'}
        </span>
      </div>

      {/* Expandable Arguments Section */}
      {showArguments && toolCall.function_arguments && (
        <div css={css`
          border-top: 1px solid ${isOutputTool ? '#FDE68A' : '#7DD3FC'};
          padding-top: 12px;
          margin-top: 8px;
        `}>
          <div css={css`
            font-family: 'Figtree', sans-serif;
            font-size: 11px;
            font-weight: 600;
            color: ${isOutputTool ? '#78350F' : '#075985'};
            margin-bottom: 8px;
            opacity: 0.7;
          `}>
            Input Arguments – ID: {toolCall.id}
          </div>
          <pre css={css`
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 11px;
            color: ${isOutputTool ? '#92400E' : '#0369A1'};
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            opacity: 0.8;
            max-height: 300px;
            overflow-y: auto;
          `}>
            {formatArguments()}
          </pre>
        </div>
      )}

      {/* Response Section (for output tools) */}
      {isOutputTool && (
        <div css={css`
          margin-top: 8px;
        `}>
          <button
            onClick={() => setShowResponse(!showResponse)}
            css={css`
              background: none;
              border: none;
              cursor: pointer;
              padding: 0;
              display: flex;
              align-items: center;
              gap: 6px;
              font-family: 'Figtree', sans-serif;
              font-size: 11px;
              font-weight: 600;
              color: #78350F;
              opacity: 0.7;
              transition: opacity 0.2s;
              &:hover {
                opacity: 1;
              }
            `}
          >
            <span css={css`
              transition: transform 0.2s;
              transform: rotate(${showResponse ? '90deg' : '0deg'});
              display: flex;
              align-items: center;
            `}>
              <ChevronIcon />
            </span>
            Response
          </button>

          {showResponse && (
            <div css={css`
              margin-top: 8px;
              border-top: 1px solid #FDE68A;
              padding-top: 12px;
            `}>
              <pre css={css`
                font-family: 'Monaco', 'Courier New', monospace;
                font-size: 11px;
                color: #92400E;
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
                opacity: 0.8;
                max-height: 300px;
                overflow-y: auto;
              `}>
                {formatOutput()}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Error message for failed tools */}
      {!isSuccess && (
        <div css={css`
          margin-top: 8px;
          padding: 12px;
          background-color: #FEE2E2;
          border: 1px solid #FCA5A5;
          border-radius: 6px;
        `}>
          <div css={css`
            font-family: 'Figtree', sans-serif;
            font-size: 12px;
            color: #991B1B;
          `}>
            ❌ Tool execution failed
            {toolCall.status && (
              <span css={css`
                margin-left: 8px;
                font-size: 11px;
                opacity: 0.8;
              `}>
                Status: {toolCall.status}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ToolIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2L10 3L6 7L5 6L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9L2 10L6 6L7 7L3 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default ToolResponseRenderer
