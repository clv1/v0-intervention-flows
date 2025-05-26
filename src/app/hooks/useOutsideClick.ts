import { useEffect } from 'react';

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (
        (ref.current && !ref.current.contains(target)) ||
        target.className === 'menu-item' ||
        target.className === 'settings-menu-text' ||
        (target.parentNode instanceof HTMLElement &&
          target.parentNode.classList.contains('settings-menu-icon') &&
          target.classList.contains('header-item'))
      ) {
        const classesToCheck = [
          'account-container',
          'account-img',
          'account-name',
          'account-username',
          'arrow-icon',
        ];

        const isTargetClassMatched = classesToCheck.some((className) =>
          target.classList.contains(className)
        );

        if (
          (!isTargetClassMatched && target.tagName !== 'path') ||
          (target.tagName === 'path' &&
            target.parentNode instanceof HTMLElement &&
            !target.parentNode.classList.contains('arrow-icon'))
        ) {
          callback();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

export default useOutsideClick;
