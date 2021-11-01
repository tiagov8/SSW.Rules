import React, { useRef, useEffect } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */

//This is a workaround as per the suggestion
//https://stackoverflow.com/questions/32553158/detect-click-outside-react-component?answertab=votes#tab-top

export default function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
