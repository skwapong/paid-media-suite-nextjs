'use client';

import { css } from '@emotion/react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AgentSettings from '../settings/AgentSettings'

interface LeftNavigationProps {
  onExpandChange?: (isExpanded: boolean) => void
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({ onExpandChange }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleMouseEnter = () => {
    setIsExpanded(true)
    onExpandChange?.(true)
  }

  const handleMouseLeave = () => {
    setIsExpanded(false)
    onExpandChange?.(false)
  }

  return (
    <>
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        css={css`
          width: ${isExpanded ? '240px' : '64px'};
          min-width: ${isExpanded ? '240px' : '64px'};
          max-width: ${isExpanded ? '240px' : '64px'};
          background: linear-gradient(180deg, #141023 0%, #2e41a6 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
          height: 100vh;
          transition: width 0.3s ease-in-out, min-width 0.3s ease-in-out, max-width 0.3s ease-in-out;
        `}
      >
        {/* Top Section - Logo and Main Nav */}
        <div css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        `}>
          {/* TD Diamond Logo */}
          <div
            onClick={() => router.push('/')}
            css={css`
              width: 32px;
              height: 23px;
              margin-bottom: 32px;
              cursor: pointer;
              &:hover {
                opacity: 0.8;
              }
            `}>
            <svg width="32" height="23" viewBox="0 0 49 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.6524 33.5052L47.3432 10.628C48.2484 9.67329 48.2484 8.12412 47.3432 7.1694L41.6455 1.16007C40.9418 0.417915 39.9888 0 38.9948 0H9.0273C8.03328 0 7.08025 0.417915 6.37658 1.16007L0.678905 7.1658C-0.226302 8.12052 -0.226302 9.66968 0.678905 10.6244L22.3697 33.5016C23.2749 34.4563 24.7437 34.4563 25.6489 33.5016L25.6524 33.5052Z" fill="url(#paint0_linear_favicon)"/>
              <path opacity="0.4" d="M6.21484 1.3258C7.00049 0.497174 8.12432 0.140506 9.21057 0.374682L46.8774 8.44836C47.6289 8.61048 47.9807 9.44992 47.7041 10.12C48.2164 9.18332 48.0969 7.9692 47.3386 7.1658L41.6443 1.16007C40.9406 0.417915 39.9876 0 38.9936 0H9.02611C8.03209 0 7.07906 0.417915 6.37539 1.16007L6.21826 1.3258H6.21484Z" fill="url(#paint1_linear_favicon)"/>
              <path opacity="0.4" d="M39.7301 1.74011L37.5234 6.43805L46.8795 8.44476C47.631 8.60688 47.9828 9.44631 47.7062 10.1164C48.2185 9.17971 48.099 7.9656 47.3407 7.16219L41.6464 1.16007C40.9427 0.417915 39.9897 0 38.9957 0H38.7053C39.5525 0 40.1058 0.940308 39.7301 1.74011Z" fill="url(#paint2_linear_favicon)"/>
              <path d="M47.709 10.1198C47.9892 9.44607 47.6339 8.60664 46.8824 8.44812L37.5263 6.44141L24.9662 33.2024C24.6143 33.9517 23.8184 34.2616 23.125 34.0382C23.9653 34.4057 24.9696 34.2291 25.6527 33.5086L47.3436 10.6314C47.4904 10.4764 47.61 10.3035 47.709 10.1234V10.1198Z" fill="url(#paint3_linear_favicon)"/>
              <defs>
                <linearGradient id="paint0_linear_favicon" x1="13.4577" y1="28.1732" x2="33.1532" y2="-4.1674" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60C5FF"/>
                  <stop offset="1" stopColor="#A0DDFF"/>
                </linearGradient>
                <linearGradient id="paint1_linear_favicon" x1="26.7852" y1="6.70465" x2="30.452" y2="-7.64561" gradientUnits="userSpaceOnUse">
                  <stop offset="0.07" stopColor="white"/>
                  <stop offset="0.89" stopColor="#7DD3FF"/>
                </linearGradient>
                <linearGradient id="paint2_linear_favicon" x1="39.5764" y1="8.33307" x2="51.6508" y2="-1.45409" gradientUnits="userSpaceOnUse">
                  <stop offset="0.07" stopColor="white"/>
                  <stop offset="0.89" stopColor="#7DD3FF"/>
                </linearGradient>
                <linearGradient id="paint3_linear_favicon" x1="24.5016" y1="17.4045" x2="42.8104" y2="23.4125" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4A9FE8"/>
                  <stop offset="0.98" stopColor="#8BCDFF"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Navigation Icons */}
          <NavIcon icon="home" label="Home" isActive={pathname === '/'} onClick={() => router.push('/')} isExpanded={isExpanded} />
          <NavIcon icon="personalization" label="Growth Studio" isActive={pathname === '/campaign-hub'} onClick={() => router.push('/campaign-hub')} isExpanded={isExpanded} />
        </div>

        {/* Bottom Section - Settings */}
        <div css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        `}>
          <NavIcon icon="settings" label="Agent Settings" isActive={false} onClick={() => setShowSettings(true)} isExpanded={isExpanded} />
          <NavIcon icon="profile" label="Profile" isActive={false} inactive isExpanded={isExpanded} />
        </div>
      </aside>

      {/* Agent Settings Modal */}
      <AgentSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

interface NavIconProps {
  icon: string
  label: string
  isActive: boolean
  onClick?: () => void
  inactive?: boolean
  isExpanded?: boolean
}

const NavIcon: React.FC<NavIconProps> = ({ icon, label, isActive, onClick, inactive = false, isExpanded = false }) => {
  return (
    <div
      css={css`
        width: 100%;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: ${isExpanded ? 'flex-start' : 'center'};
        position: relative;
        cursor: ${inactive ? 'not-allowed' : 'pointer'};
        border-right: 4px solid transparent;
        opacity: ${inactive ? '0.4' : '1'};
        padding: ${isExpanded ? '0 16px' : '0'};
        gap: ${isExpanded ? '12px' : '0'};
        transition: padding 0.3s ease-in-out, gap 0.3s ease-in-out;
        ${isActive && !inactive && `
          border-right-color: #824BFB;
        `}
        ${!inactive && `
          &:hover {
            opacity: 0.8;
          }
        `}
      `}
      title={!isExpanded ? label : undefined}
      onClick={inactive ? undefined : onClick}
    >
      <div css={css`
        width: 40px;
        height: 40px;
        min-width: 40px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        background-color: ${isActive ? '#824BFB' : 'rgba(255, 255, 255, 0.1)'};
        ${!inactive && `
          &:hover {
            background-color: ${isActive ? '#824BFB' : 'rgba(255, 255, 255, 0.2)'};
          }
        `}
      `}>
        <IconSvg icon={icon} />
      </div>
      {isExpanded && (
        <span css={css`
          font-family: 'Figtree', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}>
          {label}
        </span>
      )}
    </div>
  )
}

const IconSvg: React.FC<{ icon: string }> = ({ icon }) => {
  const iconColor = "white"

  switch (icon) {
    case 'home':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 10.5L14 2.3L24.5 10.5V23.3H17.5V16.3H10.5V23.3H3.5V10.5Z" fill={iconColor}/>
        </svg>
      )
    case 'ai':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 5.8L15.2 10.2L19.6 11.2L15.2 12.2L14 16.8L12.8 12.2L8.4 11.2L12.8 10.2L14 5.8Z" fill={iconColor}/>
          <path d="M18.9 12.6L19.46 14.84L21.7 15.4L19.46 15.96L18.9 18.2L18.34 15.96L16.1 15.4L18.34 14.84L18.9 12.6Z" fill={iconColor} opacity="0.6"/>
        </svg>
      )
    case 'workspace':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7.6" y="8.8" width="4.9" height="4.9" rx="1.1" fill={iconColor}/>
          <rect x="15.5" y="8.8" width="4.9" height="4.9" rx="1.1" fill={iconColor}/>
          <rect x="7.6" y="15.5" width="4.9" height="4.9" rx="1.1" fill={iconColor}/>
          <rect x="15.5" y="15.5" width="4.9" height="4.9" rx="1.1" fill={iconColor}/>
        </svg>
      )
    case 'data':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="14" cy="10.5" rx="5.6" ry="2.1" fill={iconColor}/>
          <path d="M8.4 10.5V17.5C8.4 18.6598 10.907 19.6 14 19.6C17.093 19.6 19.6 18.6598 19.6 17.5V10.5" fill={iconColor}/>
          <ellipse cx="14" cy="14" rx="5.6" ry="2.1" fill={iconColor} opacity="0.7"/>
          <ellipse cx="14" cy="17.5" rx="5.6" ry="2.1" fill={iconColor} opacity="0.5"/>
        </svg>
      )
    case 'engage':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 9.9L19.6 7V21L14 18.1V9.9Z" fill={iconColor}/>
          <path d="M14 9.9C14 9.9 9.8 11.2 9.8 14C9.8 16.8 14 18.1 14 18.1V9.9Z" fill={iconColor}/>
          <rect x="11.2" y="16.8" width="1.4" height="4.2" rx="0.7" fill={iconColor}/>
          <rect x="21" y="7" width="1.4" height="14" rx="0.7" fill={iconColor}/>
        </svg>
      )
    case 'audience':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7.6" y="15.2" width="2.9" height="4.1" rx="1.45" fill={iconColor}/>
          <rect x="12.5" y="11.1" width="2.9" height="8.2" rx="1.45" fill={iconColor}/>
          <rect x="17.5" y="13.4" width="2.9" height="5.8" rx="1.45" fill={iconColor}/>
        </svg>
      )
    case 'personalization':
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Screen background */}
          <rect x="5" y="5" width="18" height="14" rx="2" fill={iconColor}/>
          {/* Play button */}
          <path d="M12 10L17 13L12 16V10Z" fill="#141023"/>
          {/* Monitor stand/base */}
          <rect x="11" y="19" width="6" height="1.5" rx="0.75" fill={iconColor}/>
          {/* Slider track */}
          <rect x="5" y="21.5" width="10" height="2" rx="1" fill={iconColor}/>
          {/* Slider knob */}
          <circle cx="10" cy="22.5" r="1.5" fill="#141023"/>
          {/* Dollar badge circle */}
          <circle cx="22" cy="22" r="5" fill={iconColor}/>
          {/* Dollar sign */}
          <text x="22" y="25.5" fontSize="8" fontWeight="bold" fill="#141023" textAnchor="middle" fontFamily="Arial">$</text>
        </svg>
      )
    case 'creative':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="8.2" width="14" height="11.1" rx="1.4" fill={iconColor}/>
          <path d="M11.7 12.3L14 14.6L16.3 12.3" stroke="#141023" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <circle cx="14" cy="14" r="4.2" stroke="#141023" strokeWidth="1.1" fill="none"/>
        </svg>
      )
    case 'jobs':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="11.1" width="14" height="2.1" rx="1.05" fill={iconColor}/>
          <rect x="7" y="14.6" width="14" height="2.1" rx="1.05" fill={iconColor}/>
        </svg>
      )
    case 'control':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8.2" y="9.9" width="4.2" height="2.1" rx="1.05" fill={iconColor}/>
          <circle cx="10.5" cy="10.9" r="1.75" fill="white" stroke={iconColor} strokeWidth="0.7"/>
          <rect x="8.2" y="13.4" width="4.2" height="2.1" rx="1.05" fill={iconColor}/>
          <circle cx="10.5" cy="14.4" r="1.75" fill="white" stroke={iconColor} strokeWidth="0.7"/>
          <rect x="15.6" y="9.9" width="4.2" height="2.1" rx="1.05" fill={iconColor}/>
          <circle cx="17.5" cy="10.9" r="1.75" fill="white" stroke={iconColor} strokeWidth="0.7"/>
          <rect x="15.6" y="13.4" width="4.2" height="2.1" rx="1.05" fill={iconColor}/>
          <circle cx="17.5" cy="14.4" r="1.75" fill="white" stroke={iconColor} strokeWidth="0.7"/>
        </svg>
      )
    case 'release':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill={iconColor}/>
        </svg>
      )
    case 'settings':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill={iconColor}/>
          <path d="M19.4 15C19.1277 15.6171 18.7583 16.183 18.3 16.68L19.5 18.9L17.4 20.9L15.2 19.7C14.7033 20.1583 14.1374 20.5277 13.52 20.8L13 23H11L10.48 20.8C9.86263 20.5277 9.29667 20.1583 8.8 19.7L6.6 20.9L4.5 18.9L5.7 16.68C5.24167 16.183 4.87226 15.6171 4.6 15L2 14.5V12.5L4.6 12C4.87226 11.3829 5.24167 10.817 5.7 10.32L4.5 8.1L6.6 6.1L8.8 7.3C9.29667 6.84167 9.86263 6.47226 10.48 6.2L11 4H13L13.52 6.2C14.1374 6.47226 14.7033 6.84167 15.2 7.3L17.4 6.1L19.5 8.1L18.3 10.32C18.7583 10.817 19.1277 11.3829 19.4 12L22 12.5V14.5L19.4 15Z" fill={iconColor}/>
        </svg>
      )
    case 'profile':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" fill={iconColor}/>
          <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z" fill={iconColor}/>
        </svg>
      )
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke={iconColor} strokeWidth="2"/>
        </svg>
      )
  }
}

export default LeftNavigation
