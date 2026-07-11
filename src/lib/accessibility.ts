// Accessibility utilities and helpers

/**
 * Generate a unique ID for accessibility attributes
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within a container (for modals, dropdowns, etc.)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Manage focus restoration for modals
 */
export function useFocusRestoration() {
  let previousActiveElement: HTMLElement | null = null;

  const saveFocus = () => {
    previousActiveElement = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  };

  return { saveFocus, restoreFocus };
}

/**
 * Check if an element is visible to screen readers
 */
export function isScreenReaderVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    !element.getAttribute('aria-hidden')
  );
}

/**
 * Add keyboard navigation support
 */
export function addKeyboardNavigation(
  element: HTMLElement,
  handlers: {
    Enter?: () => void;
    Escape?: () => void;
    ArrowUp?: () => void;
    ArrowDown?: () => void;
    ArrowLeft?: () => void;
    ArrowRight?: () => void;
    Home?: () => void;
    End?: () => void;
  }
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        handlers.Enter?.();
        break;
      case 'Escape':
        handlers.Escape?.();
        break;
      case 'ArrowUp':
        handlers.ArrowUp?.();
        break;
      case 'ArrowDown':
        handlers.ArrowDown?.();
        break;
      case 'ArrowLeft':
        handlers.ArrowLeft?.();
        break;
      case 'ArrowRight':
        handlers.ArrowRight?.();
        break;
      case 'Home':
        handlers.Home?.();
        break;
      case 'End':
        handlers.End?.();
        break;
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get ARIA attributes for common UI patterns
 */
export const ariaAttributes = {
  // Button
  button: (pressed?: boolean, expanded?: boolean, disabled?: boolean) => ({
    'aria-pressed': pressed,
    'aria-expanded': expanded,
    'aria-disabled': disabled,
    role: 'button',
  }),

  // Dialog/Modal
  dialog: (labelledBy?: string, describedBy?: string) => ({
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),

  // Menu
  menu: (labelledBy?: string) => ({
    role: 'menu',
    'aria-labelledby': labelledBy,
  }),

  // MenuItem
  menuItem: (disabled?: boolean) => ({
    role: 'menuitem',
    'aria-disabled': disabled,
  }),

  // Tab
  tab: (selected?: boolean, controls?: string) => ({
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
  }),

  // TabPanel
  tabPanel: (labelledBy?: string) => ({
    role: 'tabpanel',
    'aria-labelledby': labelledBy,
  }),

  // Accordion
  accordion: (labelledBy?: string) => ({
    role: 'region',
    'aria-labelledby': labelledBy,
  }),

  // Tooltip
  tooltip: (describedBy?: string) => ({
    'aria-describedby': describedBy,
  }),

  // Alert
  alert: () => ({
    role: 'alert',
    'aria-live': 'assertive',
  }),

  // Status
  status: () => ({
    role: 'status',
    'aria-live': 'polite',
  }),
};

/**
 * Skip to main content link generator
 */
export function createSkipLink(): HTMLAnchorElement {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg';
  return skipLink;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration based on reduced motion preference
 */
export function getSafeAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Add visual focus styles for keyboard navigation
 */
export function addFocusVisibleStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    /* Focus visible styles for keyboard navigation */
    :focus-visible {
      outline: 2px solid #0F766E;
      outline-offset: 2px;
    }
    
    /* Hide focus outline for mouse users */
    :focus:not(:focus-visible) {
      outline: none;
    }
    
    /* Screen reader only class */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    /* Show when focused */
    .sr-only.focus\:not-sr-only:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
  `;
  document.head.appendChild(style);
}
