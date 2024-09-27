import {
  CancelablePromise,
  TypedError,
  supports,
  type ExecuteWithOptions,
  type InvoiceStatus,
} from '@telegram-apps/bridge';

import { $version, request } from '@/scopes/globals/globals.js';
import { ERR_INVALID_HOSTNAME, ERR_INVALID_SLUG, ERR_ALREADY_CALLED } from '@/errors.js';

import { isOpened } from './signals.js';

const MINI_APPS_METHOD = 'web_app_open_invoice';

/**
 * @returns True if the invoice is supported.
 */
export function isSupported(): boolean {
  return supports(MINI_APPS_METHOD, $version());
}

/**
 * Opens an invoice using its slug.
 * Example of the value: `jd231xxSd1`
 * @param slug - invoice slug.
 * @param options - additional options.
 * @throws {TypedError} ERR_ALREADY_CALLED
 * @throws {TypedError} ERR_INVALID_HOSTNAME
 * @throws {TypedError} ERR_INVALID_SLUG
 */
function _open(slug: string, options?: ExecuteWithOptions): CancelablePromise<InvoiceStatus>;

/**
 * Opens an invoice using its url.
 *
 * The function expects to pass a link in a full format, with the hostname "t.me".
 * Examples:
 * - `https://t.me/$jd231xxSd1`
 * - `https://t.me/invoice/jd231xxSd1`
 * @param url - invoice URL.
 * @param type - value type.
 * @param options - additional options.
 * @throws {TypedError} ERR_ALREADY_CALLED
 * @throws {TypedError} ERR_INVALID_HOSTNAME
 * @throws {TypedError} ERR_INVALID_SLUG
 */
function _open(url: string, type: 'url', options?: ExecuteWithOptions): CancelablePromise<InvoiceStatus>;

function _open(
  urlOrSlug: string,
  optionsOrType?: 'url' | ExecuteWithOptions,
  options?: ExecuteWithOptions,
): CancelablePromise<InvoiceStatus> {
  return CancelablePromise.withFn(() => {
    if (isOpened()) {
      throw new TypedError(ERR_ALREADY_CALLED);
    }

    let slug: string;

    if (optionsOrType === 'url') {
      const { hostname, pathname } = new URL(urlOrSlug, window.location.href);
      if (hostname !== 't.me') {
        throw new TypedError(ERR_INVALID_HOSTNAME);
      }

      // Valid examples:
      // "/invoice/my-slug"
      // "/$my-slug"
      const match = pathname.match(/^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/);
      if (!match) {
        throw new TypedError(ERR_INVALID_SLUG);
      }
      [, , slug] = match;
    } else {
      slug = urlOrSlug;
      options = optionsOrType;
    }

    isOpened.set(true);

    return request(MINI_APPS_METHOD, 'invoice_closed', {
      ...options,
      params: { slug },
      capture: (data) => slug === data.slug,
    })
      .then(r => r.status)
      .finally(() => {
        isOpened.set(false);
      });
  });
}

export const open = withIsSupported(_open, MINI_APPS_METHOD);
