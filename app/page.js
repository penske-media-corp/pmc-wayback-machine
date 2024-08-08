'use client';

import styles from "./page.module.scss";
import useAppState from './use-app-state';
import { BsBucket } from "react-icons/bs";
import { FiHome, FiPlusCircle, FiRotateCw } from "react-icons/fi";
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from '@headlessui/react';

/**
 * Home component.
 *
 * Entry point for the application.
 *
 * The `useAppState()` hook abstracts state and business logic allowing our
 * component tree to focus on templating.
 */
export default function Home() {
  const appState = useAppState();
  const {
    data,
    error,
    isPending,
    setState,
  } = appState;

  // Bucket data is loading.
  if (isPending) {
    return <div>Loading</div>;
  }

  // Bucket data failed.
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.heading}>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">PMC Screenshot Dashboard</h1>
            <button
              className="rounded-md bg-indigo-600 p-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setState('addNewCaptureModalIsOpen', true)}
            >
              <FiPlusCircle className="-ml-0.5 h-5 w-5" />
              <span>Add URL</span>
            </button>
          </div>
          <Breadcrumbs {...appState} />
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.inner}>
          <List {...appState} />
        </div>
      </main>
      <AssetViewModal {...appState} />
      <AddNewCaptureModal {...appState} />
    </>
  );
}

/**
 * Breadcrumbs component.
 *
 * @param {array} options.prefixParts Prefix delimited
 */
const Breadcrumbs = ({
  prefixParts,
}) => {
  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-1">
        <li>
          <div>
            <a
              className="text-sm font-medium text-gray-500 hover:text-gray-700 flex gap-4"
              href="#"
            >
              <BsBucket aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              <span>s3://{process.env.NEXT_PUBLIC_BUCKET_NAME}</span>
            </a>
          </div>
        </li>
        {prefixParts.map((prefixPart) => (
          <li key={prefixPart.prefix}>
            <div className="flex items-center">
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0 text-gray-300"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <a
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 max-w-sm whitespace-nowrap overflow-hidden overflow-ellipsis"
                href={`#${prefixPart.nextValue}`}
              >
                {prefixPart.prefix}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * List component.
 *
 * Displays the directory contents.
 *
 * @param {array}    folders     Folders in current directory.
 * @param {array}    objects     Objects in current directory.
 * @param {string}   prefix      Prefix for the current directory.
 * @param {array}    prefixParts Array of prefix parts for the current directory.
 * @param {function} setState    Helper to update state.
 */
const List = ({
  folders = [],
  objects = [],
  prefix = '',
  prefixParts = [],
  setState = () => {},
}) => {
  return (
    <>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Modified</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">File Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {'' !== prefix && (
                  <tr>
                    <td
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 hover:underline"
                      colSpan="3"
                    >
                     <a
                        className="hover:underline"
                        href={`#${prefixParts?.[ prefixParts?.length - 2 ]?.nextValue ?? ''}`}
                      >
                        ../
                      </a>
                    </td>
                  </tr>
                )}
                {folders && folders.map(({name}, index) =>
                  <tr key={`folder-${name}-${index}`}>
                    <td
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 hover:underline"
                      colSpan="3"
                    >
                      <a
                        className="hover:underline"
                        href={`#${prefix}${name}`}
                      >
                        {name}
                      </a>
                    </td>
                  </tr>
                )}
                {objects && objects.map(({
                  lastModified,
                  name,
                  size,
                  url,
                }, index) =>
                  <tr key={`object-${name}-${index}`}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      <button onClick={() => setState('objectUrl', url)}>
                        {name}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(lastModified, 'MM/dd/yyyy')}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{size}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Modal component.
 *
 * Displays when objectUrl has a non-empty value.
 *
 * @see https://headlessui.com/react/dialog
 *
 * @param {function} setState        Helper to update state.
 * @param {string}   state.objectUrl Selected object url.
 */
const AssetViewModal = ({
  setState,
  state: {
    objectUrl,
  },
}) => {
  return (
    <Dialog
      className="relative z-10"
      onClose={() => setState('objectUrl', '')}
      open={0 !== objectUrl?.length ?? 0}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="text-center">
                <img src={objectUrl} />
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {objectUrl}
                  </p>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

const AddNewCaptureModal = ({
  setState,
  state: {
    addNewCaptureModalIsOpen,
  }
}) => {
  const emailInput = useRef(null);
  const [ isSending, setIsSending ] = useState(false);
  const [ helpText, setHelpText ] = useState('');

  /**
   * Handle form submission.
   *
   * Grab the URL and hit the GitHub endpoint to trigger a new Checkly test.
   */
  const submitForm = async (event) => {
    event.preventDefault();
    const url = emailInput?.current?.value ?? '';

    try {
      new URL(url);
    } catch(error) {
      setHelpText('Invalid URL. Try again!');
      return;
    }

    setIsSending(true);
    setHelpText('Processing...')
    try {
      const result = await fetch(
        '/api/v1/github/capture-url-workflow',
        {
          method: 'POST',
          body: JSON.stringify({ url }),
        }
      );

      const responseCode = result.status;
      if (200 !== responseCode ) {
        setIsSending(false);
        setHelpText(`Failed to connect to GitHub. Check your API key.` );
        return;
      }

      setIsSending(false);
      setHelpText(`Capture Job Scheduled. I'm not smart enough to let you know once it's finished, but keep refreshing until you see it` );
    } catch(exception) {
      setHelpText('Something went wrong. Try again!');
    }
  };

  return (
    <Dialog
      className={`${styles.submitForm} relative z-10`}
      onClose={() => setState('addNewCaptureModalIsOpen', false)}
      open={addNewCaptureModalIsOpen}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            className={`${styles.dialogPanel} relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95`}
            transition
          >
           <DialogTitle className="font-bold">Capture URL</DialogTitle>
            <form onSubmit={submitForm}>
              <div className={styles.formEmail}>
                <label>
                  <input
                    className="rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    ref={emailInput}
                    type="url"
                  />
                </label>
              </div>
              <div>
                <button
                  className="rounded-md bg-indigo-600 p-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {(true) && (
                    <>
                      <FiPlusCircle className="-ml-0.5 h-5 w-5" /> <span>Capture URL</span>
                    </>
                  )}
                  {(false) && (
                    <>
                      <FiRotateCw className="-ml-0.5 h-5 w-5" /> <span> Sending...</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {0 !== helpText?.length && (
              <div className="text-sm mt-5">
                {helpText}
              </div>
            ) }
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
