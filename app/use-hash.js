import {
  useCallback,
  useEffect,
  useState,
} from 'react';

/**
 * Hook to work with the url hash.
 *
 * @return {array} Hash value and setter function.
 */
export const useHash = () => {

  const [hash, setHash] = useState(null);

  useEffect(() => {
    if ( null === hash ) {
      setHash( window.location.hash );
    }
  }, [hash]);

  const hashChangeHandler = useCallback(() => {
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler);
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler);
    };
  }, []);

  const updateHash = useCallback(
    newHash => {
      if (newHash !== hash) window.location.hash = newHash;
    },
    [hash]
  );

  return [
    (hash ?? '').substring(1), // Remove the hash itself.
    updateHash
  ];
};
