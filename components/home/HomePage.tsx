'use client';

import { css } from '@emotion/react'
import { useRouter } from 'next/navigation'

const HomePage = () => {
  const router = useRouter()

  return (
    <div css={css`
      display: flex;
      width: 100%;
      height: 100%;
      background-color: #F7F8FA;
    `}>
      {/* Main Content */}
      <div css={css`
        flex: 1;
        overflow-y: auto;
        padding: 40px 48px;
      `}>
        {/* Header */}
        <h1 css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 600;
          font-size: 28px;
          color: #1A1A1A;
          margin: 0 0 40px 0;
        `}>
          Welcome Everyone!
        </h1>

        {/* Your Applications Section */}
        <div css={css`
          margin-bottom: 24px;
        `}>
          <h2 css={css`
            font-family: 'Figtree', sans-serif;
            font-weight: 600;
            font-size: 16px;
            color: #1A1A1A;
            margin: 0 0 16px 0;
          `}>
            Your Applications
          </h2>

          <div css={css`
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          `}>
            {/* AI Agent Foundry */}
            <ApplicationTile
              icon={<FoundryIcon />}
              title="AI Agent Foundry"
              description="Build and manage AI agents, apps and knowledge bases to power customer experiences."
              disabled
            />

            {/* Foundry Workspace */}
            <ApplicationTile
              icon={<WorkspaceIcon />}
              title="Foundry Workspace"
              description="Access and use purpose-built AI agents across campaigns, insights and operations."
              disabled
            />

            {/* Engage Studio */}
            <ApplicationTile
              icon={<EngageIcon />}
              title="Engage Studio"
              description="Deliver and orchestrate AI-driven personalized email"
              disabled
            />

            {/* Creative Studio */}
            <ApplicationTile
              icon={<CreativeIcon />}
              title="Creative Studio"
              description="Use generative AI to create engaging and brand compliant content."
              disabled
            />

            {/* Audience Studio */}
            <ApplicationTile
              icon={<AudienceIcon />}
              title="Audience Studio"
              description="Identify, understand, and segment target audiences to deliver personalized marketing campaigns"
              disabled
            />

            {/* Growth Studio */}
            <ApplicationTile
              icon={<PaidMediaIcon />}
              title="Growth Studio"
              description="Create, optimize, and analyze paid media campaign performance to drive measurable marketing growth"
              onClick={() => router.push('/campaign-hub')}
              showBeta
            />

            {/* Data Workbench */}
            <ApplicationTile
              icon={<DataIcon />}
              title="Data Workbench"
              description="Manage queries, workflows, and databases to create Parent Segments"
              disabled
            />

            {/* Jobs */}
            <ApplicationTile
              icon={<JobsIcon />}
              title="Jobs"
              description="Quickly review the status of your queries and data imports"
              disabled
            />

            {/* Control Panel */}
            <ApplicationTile
              icon={<ControlPanelIcon />}
              title="Control Panel"
              description="Manage the settings of your Treasure Data Console"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Resources Sidebar */}
      <aside css={css`
        width: 280px;
        min-width: 280px;
        background-color: white;
        border-left: 1px solid #E5E7EB;
        padding: 40px 24px;
        overflow-y: auto;
      `}>
        <h3 css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #1A1A1A;
          margin: 0 0 20px 0;
        `}>
          Resources
        </h3>

        <div css={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
        `}>
          <ResourceLink icon={<DocsIcon />} label="Documentation" />
          <ResourceLink icon={<ReleaseIcon />} label="Release Notes" />
          <ResourceLink icon={<AcademyIcon />} label="TD Academy" />
          <ResourceLink icon={<BoxesIcon />} label="Treasure Boxes" />
          <ResourceLink icon={<ChatIcon />} label="Live Chat" />
          <ResourceLink icon={<TicketIcon />} label="Support Tickets" />
          <ResourceLink icon={<StatusIcon />} label="System Status" />
          <ResourceLink icon={<KeyboardIcon />} label="Keyboard Shortcuts" />
        </div>
      </aside>
    </div>
  )
}

interface ApplicationTileProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  showBeta?: boolean
  disabled?: boolean
}

const ApplicationTile: React.FC<ApplicationTileProps> = ({ icon, title, description, onClick, showBeta = false, disabled = false }) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      css={css`
        background-color: white;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 20px;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? '0.5' : '1'};
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 12px;
        position: relative;

        ${!disabled && `
          &:hover {
            box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.08);
            border-color: #D1D5DB;
          }
        `}
      `}>
      {/* Beta Badge */}
      {showBeta && (
        <div css={css`
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: #F3F4F6;
          color: #6B7280;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Figtree', sans-serif;
          font-weight: 500;
          font-size: 11px;
        `}>
          Beta
        </div>
      )}

      {/* Icon */}
      <div css={css`
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      `}>
        {icon}
      </div>

      {/* Content */}
      <div css={css`
        display: flex;
        flex-direction: column;
        gap: 8px;
      `}>
        <h3 css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 600;
          font-size: 17px;
          color: #1A1A1A;
          margin: 0;
          line-height: 1.3;
        `}>
          {title}
        </h3>
        <p css={css`
          font-family: 'Figtree', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        `}>
          {description}
        </p>
      </div>
    </div>
  )
}

interface ResourceLinkProps {
  icon: React.ReactNode
  label: string
}

const ResourceLink: React.FC<ResourceLinkProps> = ({ icon, label }) => {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      css={css`
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: #4B5563;
        font-family: 'Figtree', sans-serif;
        font-weight: 400;
        font-size: 14px;
        padding: 4px 0;
        transition: color 0.2s;

        &:hover {
          color: #6F2EFF;
        }
      `}>
      <div css={css`
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `}>
        {icon}
      </div>
      {label}
    </a>
  )
}

// Application Icon Components - matching the screenshot exactly
const FoundryIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M24 10L25.8 17.4L33.6 19.2L25.8 21L24 28.8L22.2 21L14.4 19.2L22.2 17.4L24 10Z" fill="#5DCDE8"/>
    <path d="M32.4 21.6L33.36 25.44L37.2 26.4L33.36 27.36L32.4 31.2L31.44 27.36L27.6 26.4L31.44 25.44L32.4 21.6Z" fill="#5DCDE8" opacity="0.6"/>
  </svg>
)

const WorkspaceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="13" y="15" width="8.4" height="8.4" rx="1.8" fill="#5DCDE8"/>
    <rect x="26.6" y="15" width="8.4" height="8.4" rx="1.8" fill="#5DCDE8"/>
    <rect x="13" y="26.6" width="8.4" height="8.4" rx="1.8" fill="#5DCDE8"/>
    <rect x="26.6" y="26.6" width="8.4" height="8.4" rx="1.8" fill="#5DCDE8"/>
  </svg>
)

const EngageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {/* Megaphone body */}
    <path d="M24 17L33.6 12V36L24 31V17Z" fill="#A78BF5"/>
    {/* Megaphone cone */}
    <path d="M24 17C24 17 16.8 19.2 16.8 24C16.8 28.8 24 31 24 31V17Z" fill="#A78BF5"/>
    {/* Handle */}
    <rect x="19.2" y="28.8" width="2.4" height="7.2" rx="1.2" fill="#A78BF5"/>
    {/* Vertical lines */}
    <rect x="36" y="12" width="2.4" height="24" rx="1.2" fill="#A78BF5"/>
  </svg>
)

const CreativeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="12" y="14" width="24" height="19" rx="2.4" fill="#FFB84D"/>
    <path d="M20 21L24 25L28 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="24" cy="24" r="7.2" stroke="white" strokeWidth="1.8" fill="none"/>
  </svg>
)

const AudienceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="13" y="26" width="5" height="7" rx="2.5" fill="#F5B565"/>
    <rect x="21.5" y="19" width="5" height="14" rx="2.5" fill="#F5B565"/>
    <rect x="30" y="23" width="5" height="10" rx="2.5" fill="#F5B565"/>
  </svg>
)

const PaidMediaIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    {/* Screen/monitor */}
    <rect x="12" y="13" width="21.6" height="15.6" rx="1.8" fill="#85CC16" opacity="0.3"/>
    {/* Play button triangle */}
    <path d="M20 17L26.5 21L20 25V17Z" fill="#85CC16"/>
    {/* Monitor stand */}
    <rect x="20" y="28.8" width="4.8" height="2.4" rx="1.2" fill="#85CC16" opacity="0.3"/>
    {/* Dollar badge circle */}
    <circle cx="31" cy="26" r="6" fill="#85CC16"/>
    {/* Dollar sign */}
    <text x="31" y="30" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">$</text>
  </svg>
)

const DataIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="18" rx="9.6" ry="3.6" fill="#8B9FDB"/>
    <path d="M14.4 18V30C14.4 31.9883 18.698 33.6 24 33.6C29.302 33.6 33.6 31.9883 33.6 30V18" fill="#8B9FDB"/>
    <ellipse cx="24" cy="24" rx="9.6" ry="3.6" fill="#9EAEE6"/>
    <ellipse cx="24" cy="30" rx="9.6" ry="3.6" fill="#B8C5F0"/>
  </svg>
)

const JobsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="12" y="19" width="24" height="3.6" rx="1.8" fill="#85CC16"/>
    <rect x="12" y="25" width="24" height="3.6" rx="1.8" fill="#85CC16"/>
  </svg>
)

const ControlPanelIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect x="14" y="17" width="7.2" height="3.6" rx="1.8" fill="#9EAEE6"/>
    <circle cx="18" cy="18.6" r="3" fill="white" stroke="#9EAEE6" strokeWidth="1.2"/>
    <rect x="14" y="23" width="7.2" height="3.6" rx="1.8" fill="#9EAEE6"/>
    <circle cx="18" cy="24.6" r="3" fill="white" stroke="#9EAEE6" strokeWidth="1.2"/>
    <rect x="26.8" y="17" width="7.2" height="3.6" rx="1.8" fill="#9EAEE6"/>
    <circle cx="30" cy="18.6" r="3" fill="white" stroke="#9EAEE6" strokeWidth="1.2"/>
    <rect x="26.8" y="23" width="7.2" height="3.6" rx="1.8" fill="#9EAEE6"/>
    <circle cx="30" cy="24.6" r="3" fill="white" stroke="#9EAEE6" strokeWidth="1.2"/>
  </svg>
)

// Resource Icon Components
const DocsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="2" width="12" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 6H13M7 10H13M7 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const ReleaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z" fill="currentColor"/>
  </svg>
)

const AcademyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2L2 6L10 10L18 6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 10L10 14L18 10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

const BoxesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 3H17V13H11L8 17L5 13H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="6" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const StatusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const KeyboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 8H6M9 8H10M13 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="6" y="11" width="8" height="1.5" rx="0.75" fill="currentColor"/>
  </svg>
)

export default HomePage
