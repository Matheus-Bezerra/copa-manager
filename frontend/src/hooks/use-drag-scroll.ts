import { useEffect, useRef } from 'react';

const DRAG_THRESHOLD_PX = 10;

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (element == null) return;

    const container: HTMLElement = element;

    let isMouseDown = false;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    function resetDragStyles() {
      container.style.cursor = '';
      container.style.userSelect = '';
    }

    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;

      isMouseDown = true;
      isDragging = false;
      startX = event.clientX;
      scrollLeft = container.scrollLeft;
    }

    function onMouseMove(event: MouseEvent) {
      if (!isMouseDown) return;

      const deltaX = event.clientX - startX;

      if (!isDragging) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;

        isDragging = true;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none';
      }

      event.preventDefault();
      container.scrollLeft = scrollLeft - deltaX;
    }

    function onMouseUp() {
      if (!isMouseDown) return;

      if (isDragging) {
        const suppressClick = (clickEvent: MouseEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          container.removeEventListener('click', suppressClick, true);
        };

        container.addEventListener('click', suppressClick, true);
      }

      isMouseDown = false;
      isDragging = false;
      resetDragStyles();
    }

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return ref;
}
