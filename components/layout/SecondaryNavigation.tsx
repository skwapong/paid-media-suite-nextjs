import { css } from '@emotion/react'
import { useState } from 'react'
import ChatHistoryDropdown from '../chat/ChatHistoryDropdown'

interface SecondaryNavigationProps {
  onLoadChat?: (chatId: string) => void
  onNewConversation?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
  onLoadChat,
  onNewConversation,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(false)

  return (
    <aside css={css`
      width: ${isCollapsed ? '64px' : '384px'};
      min-width: ${isCollapsed ? '64px' : '384px'};
      max-width: ${isCollapsed ? '64px' : '384px'};
      background-color: var(--color-bg, #ffffff);
      border-right: 1px solid #CBD1DB;
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: ${isCollapsed ? '24px 12px' : '24px'};
      overflow-y: auto;
      overflow-x: hidden;
      height: 100vh;
      transition: all 0.3s ease-in-out;
      position: relative;
    `}>
      {/* Header */}
      <div css={css`
        display: flex;
        align-items: center;
        justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        gap: 12px;
      `}>
        {!isCollapsed && (
          <h1 css={css`
            font-family: 'Figtree', sans-serif;
            font-weight: 600;
            font-size: 24px;
            line-height: normal;
            color: #000000;
            margin: 0;
          `}>
            Growth Studio
          </h1>
        )}
      </div>

      {/* Upper Nav */}
      <div css={css`
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
      `}>
        {/* Campaign Hub - Active */}
        <div
          onClick={onNewConversation}
          title={isCollapsed ? "Campaign Hub" : undefined}
          css={css`
            background-color: #F3EEFF;
            border-radius: 8px;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: ${isCollapsed ? 'center' : 'flex-start'};
            padding: ${isCollapsed ? '12px' : '12px 16px'};
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s;
            &:hover {
              background-color: #E8DBFF;
            }
          `}>
          <HomeIcon />
          {!isCollapsed && (
            <span css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 700;
              font-size: 16px;
              color: #6F2EFF;
              flex: 1;
              line-height: 1.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}>
              Campaign Hub
            </span>
          )}
        </div>

        {/* Performance - Inactive */}
        <div
          title={isCollapsed ? "Performance" : undefined}
          css={css`
            background-color: #ffffff;
            border-radius: 8px;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: ${isCollapsed ? 'center' : 'flex-start'};
            padding: ${isCollapsed ? '12px' : '12px 16px'};
            gap: 12px;
            cursor: default;
            opacity: 0.4;
          `}>
          <PerformanceIcon />
          {!isCollapsed && (
            <span css={css`
              font-family: 'Figtree', sans-serif;
              font-weight: 400;
              font-size: 16px;
              color: #212327;
              flex: 1;
              line-height: 1.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `}>
              Performance
            </span>
          )}
        </div>

        {/* Divider */}
        <div css={css`
          height: 1px;
          background-color: #DCE1EA;
          width: 100%;
        `} />

        {/* Expanded View */}
        {!isCollapsed && (
          <>
            {/* History Section */}
            <div css={css`
              display: flex;
              flex-direction: column;
              width: 100%;
            `}>
              {/* Section Title */}
              <div css={css`
                min-height: 48px;
                display: flex;
                align-items: center;
                padding: 0 12px;
              `}>
                <span css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 600;
                  font-size: 12px;
                  color: #878F9E;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                `}>
                  History
                </span>
              </div>

              {/* Chat History */}
              <div css={css`
                display: flex;
                flex-direction: column;
                width: 100%;
              `}>
                <div css={css`
                  background-color: #ffffff;
                  border-radius: 8px;
                  min-height: 48px;
                  display: flex;
                  align-items: center;
                  padding: 0 16px;
                  gap: 8px;
                  cursor: pointer;
                  transition: background-color 0.2s;
                  &:hover {
                    background-color: #F9FBFF;
                  }
                `}
                onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
                >
                  <div css={css`
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                  `}>
                    <ChatHistoryIcon />
                    <span css={css`
                      font-family: 'Figtree', sans-serif;
                      font-weight: 400;
                      font-size: 16px;
                      color: #212327;
                      line-height: 1.4;
                    `}>
                      Chat History
                    </span>
                  </div>
                  <DownArrowIcon isExpanded={isChatHistoryExpanded} />
                </div>

                {/* Chat History Dropdown Content */}
                {isChatHistoryExpanded && (
                  <div css={css`
                    padding-left: 16px;
                    margin-top: 8px;
                  `}>
                    <ChatHistoryDropdown onLoadChat={onLoadChat} />
                  </div>
                )}
              </div>

              {/* Task History - Inactive */}
              <div css={css`
                background-color: #ffffff;
                border-radius: 8px;
                min-height: 48px;
                display: flex;
                align-items: center;
                padding: 0 16px;
                gap: 12px;
                cursor: default;
                opacity: 0.4;
              `}>
                <CampaignOptimizationIcon />
                <span css={css`
                  font-family: 'Figtree', sans-serif;
                  font-weight: 400;
                  font-size: 16px;
                  color: #212327;
                  flex: 1;
                  line-height: 1.4;
                `}>
                  Task History
                </span>
              </div>
            </div>
          </>
        )}

        {/* Collapsed View */}
        {isCollapsed && (
          <>
            {/* Chat History - Collapsed */}
            <div
              title="Chat History"
              css={css`
                background-color: #ffffff;
                border-radius: 8px;
                min-height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                cursor: pointer;
                transition: background-color 0.2s;
                &:hover {
                  background-color: #F9FBFF;
                }
              `}
            >
              <ChatHistoryIcon />
            </div>

            {/* Task History - Collapsed and Inactive */}
            <div
              title="Task History"
              css={css`
                background-color: #ffffff;
                border-radius: 8px;
                min-height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 12px;
                cursor: default;
                opacity: 0.4;
              `}>
              <CampaignOptimizationIcon />
            </div>
          </>
        )}
      </div>

      {/* Collapse Button - Bottom Right */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          css={css`
            position: absolute;
            bottom: 24px;
            right: ${isCollapsed ? '12px' : '24px'};
            background-color: #ffffff;
            border: 1px solid #DCE1EA;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 10;
            &:hover {
              background-color: #F3EEFF;
              border-color: #6F2EFF;
            }
          `}
        >
          <CollapseIcon isCollapsed={isCollapsed} />
        </button>
      )}
    </aside>
  )
}

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6L8 2L14 6V14H10V10H6V14H2V6Z" stroke="#6F2EFF" strokeWidth="1.5" fill="none"/>
  </svg>
)

const CampaignOptimizationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="3" height="3" fill="#212327"/>
    <rect x="11" y="2" width="3" height="3" fill="#212327"/>
    <rect x="2" y="11" width="3" height="3" fill="#212327"/>
    <rect x="11" y="11" width="3" height="3" fill="#212327"/>
    <line x1="5" y1="3.5" x2="11" y2="3.5" stroke="#212327" strokeWidth="1"/>
    <line x1="5" y1="12.5" x2="11" y2="12.5" stroke="#212327" strokeWidth="1"/>
    <line x1="3.5" y1="5" x2="3.5" y2="11" stroke="#212327" strokeWidth="1"/>
    <line x1="12.5" y1="5" x2="12.5" y2="11" stroke="#212327" strokeWidth="1"/>
  </svg>
)

const ChatHistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H14V11H9L6 14L3 11H2V2Z" stroke="#212327" strokeWidth="1.5" fill="none"/>
    <path d="M5 5H11M5 8H9" stroke="#212327" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const DownArrowIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    css={css`
      transition: transform 0.2s;
      transform: rotate(${isExpanded ? '180deg' : '0deg'});
    `}
  >
    <path d="M7 10L12 15L17 10" stroke="#AEAEAE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    css={css`
      transition: transform 0.3s;
      transform: rotate(${isCollapsed ? '180deg' : '0deg'});
    `}
  >
    <path d="M12 5L7 10L12 15" stroke="#6F2EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PerformanceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="6" rx="3.2" ry="1.2" fill="#212327"/>
    <path d="M4.8 6V10C4.8 10.6627 6.23482 11.2 8 11.2C9.76518 11.2 11.2 10.6627 11.2 10V6" fill="#212327"/>
    <ellipse cx="8" cy="8" rx="3.2" ry="1.2" fill="#212327" opacity="0.7"/>
    <ellipse cx="8" cy="10" rx="3.2" ry="1.2" fill="#212327" opacity="0.5"/>
  </svg>
)

export default SecondaryNavigation
