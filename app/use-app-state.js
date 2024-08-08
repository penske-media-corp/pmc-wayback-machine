import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useReducer } from 'react';
import { useHash } from './use-hash';

/**
 * Inital state.
 *
 * @type {Object}
 */
const initialState = {
  addNewCaptureModalIsOpen: false,
  objectUrl: '',
};

/**
 * Reducer.
 *
 * @param {Object} state  State object.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
const reducer = (state, action) => {
  switch (action.type) {
    default:
      return state;

    case 'set-state':
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
  }
}

/**
 * Helper hook for managing state.
 *
 * @param {Array} listOptions Initial list options.
 * @return {Object}
 */
const useAppState = () => {

  // State sources.
  const [prefix, setPrefix] = useHash();
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Helper for updating a top-level key value.
   *
   * @param {String} key   State property key.
   * @param {Mixed}  value New value.
   */
  const setState = (key, value) => dispatch({
    type: 'set-state',
    payload: {
      key,
      value,
    },
  });

  /**
   * Query for bucket contents.
   *
   * @see https://tanstack.com/query/latest
   */
  const query = useQuery({
    queryKey: ['bucket-contents', { prefix }],
    queryFn: async () => await fetch(`api/v1/s3/list-objects?prefix=${prefix}`)
        .then((response) => response.json()),
  });

  /**
   * Format query data into folders and objects for easy rendering.
   *
   * @return {object}
   */
  const formatData = () => {
    return {
      folders:
        query?.data?.CommonPrefixes?.map(({ Prefix }) => ({
          name: Prefix.slice(prefix.length),
          path: Prefix,
          url: `/?prefix=${Prefix}`,
        })) || [],
      objects:
        query?.data?.Contents?.map(
          ({ Key, LastModified, Size }) => ({
            name: Key.slice(prefix.length),
            lastModified: LastModified,
            size: Size,
            path: Key,
            url: `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.amazonaws.com/${Key}`,
          })
        ) || [],
    };
  };

  /**
   * Split up the prefix into pieces which can be used to navigate the app.
   *
   * @type {array}
   */
  const prefixParts = prefix
    .split("/")
    .filter(prefixPart => prefixPart)
    .map(prefixPart => {
      return {
        prefix: prefixPart,
        nextValue: `${prefix.split(prefixPart)[0]}${prefixPart}/`,
      };
    });

  return {
    ...formatData(),
    ...query,
    prefix,
    prefixParts,
    setPrefix,
    setState,
    state,
  };
};

export default useAppState;
