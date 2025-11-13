'use client';

import { css } from '@emotion/react';
import { usePathname } from 'next/navigation';
import { useState, useCallback, ReactNode } from 'react';
import LeftNavigation from './layout/LeftNavigation';
import SecondaryNavigation from './layout/SecondaryNavigation';

interface AppLayoutClientProps {
  children: ReactNode;
}

export default function AppLayoutClient({ children }: AppLayoutClientProps) {
  const pathname = usePathname();
  const [chatIdToLoad, setChatIdToLoad] = useState<string | null>(null);
  const [isSecondaryNavCollapsed, setIsSecondaryNavCollapsed] = useState(false);
  const [isLeftNavExpanded, setIsLeftNavExpanded] = useState(false);

  const handleLoadChat = useCallback((chatId: string) => {
    setChatIdToLoad(chatId);
  }, []);

  const handleNewConversation = useCallback(() => {
    console.log('🔙 AppLayoutClient: Setting chatIdToLoad to null (new conversation)');
    setChatIdToLoad(null);
  }, []);

  const toggleSecondaryNav = useCallback(() => {
    setIsSecondaryNavCollapsed(prev => !prev);
  }, []);

  // Determine if we should show the secondary navigation
  const showSecondaryNav = pathname === '/campaign-hub';

  return (
    <div css={css`
      display: flex;
      flex-direction: row;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    `}>
      {/* Left Navigation - 64px wide */}
      <LeftNavigation
        onExpandChange={setIsLeftNavExpanded}
      />

      {/* Secondary Navigation - 384px wide - only show on campaign-hub */}
      {showSecondaryNav && (
        <SecondaryNavigation
          onLoadChat={handleLoadChat}
          onNewConversation={handleNewConversation}
          isCollapsed={isSecondaryNavCollapsed}
          onToggleCollapse={toggleSecondaryNav}
        />
      )}

      {/* Main Content Area */}
      <main css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
      `}>
        {children}
      </main>
    </div>
  );
}
