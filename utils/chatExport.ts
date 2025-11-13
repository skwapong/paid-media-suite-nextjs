/**
 * Chat Export Utilities
 * Provides functionality to export chat conversations in various formats
 */

export interface ExportMessage {
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  activities?: string[]
}

export interface ExportOptions {
  includeTimestamps?: boolean
  includeActivities?: boolean
  format?: 'txt' | 'md' | 'json' | 'html'
}

/**
 * Export chat conversation as plain text
 */
export const exportAsText = (
  messages: ExportMessage[],
  options: ExportOptions = {}
): string => {
  const { includeTimestamps = true, includeActivities = false } = options

  let output = 'Chat Conversation Export\n'
  output += '='.repeat(50) + '\n\n'

  messages.forEach((msg, index) => {
    const role = msg.type === 'user' ? 'You' : 'Assistant'

    if (includeTimestamps) {
      const timestamp = msg.timestamp.toLocaleString()
      output += `[${timestamp}] ${role}:\n`
    } else {
      output += `${role}:\n`
    }

    output += msg.content + '\n'

    if (includeActivities && msg.activities && msg.activities.length > 0) {
      output += '\nActivities:\n'
      msg.activities.forEach(activity => {
        output += `  - ${activity}\n`
      })
    }

    output += '\n' + '-'.repeat(50) + '\n\n'
  })

  return output
}

/**
 * Export chat conversation as Markdown
 */
export const exportAsMarkdown = (
  messages: ExportMessage[],
  options: ExportOptions = {}
): string => {
  const { includeTimestamps = true, includeActivities = false } = options

  let output = '# Chat Conversation Export\n\n'
  output += `*Exported on ${new Date().toLocaleString()}*\n\n`
  output += '---\n\n'

  messages.forEach((msg, index) => {
    const role = msg.type === 'user' ? '🧑 **You**' : '🤖 **Assistant**'

    if (includeTimestamps) {
      const timestamp = msg.timestamp.toLocaleString()
      output += `### ${role}\n*${timestamp}*\n\n`
    } else {
      output += `### ${role}\n\n`
    }

    output += msg.content + '\n\n'

    if (includeActivities && msg.activities && msg.activities.length > 0) {
      output += '**Activities:**\n\n'
      msg.activities.forEach(activity => {
        output += `- ${activity}\n`
      })
      output += '\n'
    }

    output += '---\n\n'
  })

  return output
}

/**
 * Export chat conversation as JSON
 */
export const exportAsJSON = (
  messages: ExportMessage[],
  options: ExportOptions = {}
): string => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map(msg => ({
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      ...(options.includeActivities && msg.activities && { activities: msg.activities })
    }))
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Export chat conversation as HTML
 */
export const exportAsHTML = (
  messages: ExportMessage[],
  options: ExportOptions = {}
): string => {
  const { includeTimestamps = true, includeActivities = false } = options

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Conversation Export</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #6F2EFF 0%, #1957DB 100%);
      color: white;
      border-radius: 8px;
    }
    .message {
      margin-bottom: 20px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .user {
      background-color: #E8F4F8;
      border-left: 4px solid #1957DB;
    }
    .assistant {
      background-color: #F3E8FF;
      border-left: 4px solid #6F2EFF;
    }
    .role {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }
    .timestamp {
      font-size: 0.85em;
      color: #666;
      margin-left: 10px;
    }
    .content {
      line-height: 1.6;
      color: #444;
      white-space: pre-wrap;
    }
    .activities {
      margin-top: 10px;
      padding: 10px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 4px;
    }
    .activities h4 {
      margin: 0 0 8px 0;
      font-size: 0.9em;
      color: #666;
    }
    .activities ul {
      margin: 0;
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 15px;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Chat Conversation Export</h1>
    <p>Exported on ${new Date().toLocaleString()}</p>
  </div>
  <div class="messages">
`

  messages.forEach((msg) => {
    const roleClass = msg.type === 'user' ? 'user' : 'assistant'
    const roleText = msg.type === 'user' ? '🧑 You' : '🤖 Assistant'

    html += `    <div class="message ${roleClass}">
      <div class="role">
        ${roleText}
        ${includeTimestamps ? `<span class="timestamp">${msg.timestamp.toLocaleString()}</span>` : ''}
      </div>
      <div class="content">${escapeHtml(msg.content)}</div>
`

    if (includeActivities && msg.activities && msg.activities.length > 0) {
      html += `      <div class="activities">
        <h4>Activities:</h4>
        <ul>
`
      msg.activities.forEach(activity => {
        html += `          <li>${escapeHtml(activity)}</li>\n`
      })
      html += `        </ul>
      </div>
`
    }

    html += `    </div>\n`
  })

  html += `  </div>
  <div class="footer">
    <p>Generated by Paid Media Suite - Growth Studio</p>
  </div>
</body>
</html>`

  return html
}

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Download exported conversation
 */
export const downloadExport = (
  content: string,
  filename: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export conversation in specified format
 */
export const exportConversation = (
  messages: ExportMessage[],
  format: 'txt' | 'md' | 'json' | 'html' = 'md',
  options: ExportOptions = {}
): void => {
  const timestamp = new Date().toISOString().split('T')[0]
  let content: string
  let filename: string
  let mimeType: string

  switch (format) {
    case 'txt':
      content = exportAsText(messages, options)
      filename = `chat-export-${timestamp}.txt`
      mimeType = 'text/plain'
      break
    case 'md':
      content = exportAsMarkdown(messages, options)
      filename = `chat-export-${timestamp}.md`
      mimeType = 'text/markdown'
      break
    case 'json':
      content = exportAsJSON(messages, options)
      filename = `chat-export-${timestamp}.json`
      mimeType = 'application/json'
      break
    case 'html':
      content = exportAsHTML(messages, options)
      filename = `chat-export-${timestamp}.html`
      mimeType = 'text/html'
      break
    default:
      content = exportAsMarkdown(messages, options)
      filename = `chat-export-${timestamp}.md`
      mimeType = 'text/markdown'
  }

  downloadExport(content, filename, mimeType)
}
