import { parseMessage } from '../../bridge/parseMessage.js';

/**
 * Emits event sent from Telegram native application like it was sent in
 * default web environment between 2 iframes. It dispatches new MessageEvent
 * and expects it to be handled via `window.addEventListener('message', ...)`
 * as developer would do it to handle messages sent from the parent iframe.
 * @param eventType - event name.
 * @param eventData - event payload.
 */
function emitEvent(eventType: string, eventData: unknown): void {
  window.dispatchEvent(new MessageEvent('message', {
    data: JSON.stringify({ eventType, eventData }),
    // We specify window.parent to imitate the case, it sent us this event.
    source: window.parent,
  }));
}

/**
 * Defines special handlers by known paths, which are recognized by
 * Telegram as ports to receive events. This function also sets special
 * function in global window object to prevent duplicate declaration.
 */
function defineEventHandlers(): void {
  const wnd: any = window;

  // Prevent from duplicate event handlers definition.
  if ('TelegramGameProxy_receiveEvent' in wnd) {
    return;
  }

  // Iterate over each path, where "receiveEvent" function should be
  // defined. This function is called by external environment in case,
  // it wants to emit some event.
  [
    ['TelegramGameProxy_receiveEvent'], // Windows Phone.
    ['TelegramGameProxy', 'receiveEvent'], // Desktop.
    ['Telegram', 'WebView', 'receiveEvent'], // Android and iOS.
  ].forEach((path) => {
    // Path starts from "window" object.
    let pointer = wnd;

    path.forEach((item, idx, arr) => {
      // We are on the last iteration, where function property name is passed.
      if (idx === arr.length - 1) {
        pointer[item] = emitEvent;
        return;
      }

      if (!(item in pointer)) {
        pointer[item] = {};
      }
      pointer = pointer[item];
    });
  });
}

/**
 * Adds listener to window "message" event assuming, that this event could
 * be sent by Telegram native application. Calls passed callback with event
 * type and data.
 * @param cb - callback to call.
 */
export function onTelegramEvent(cb: (eventType: string, eventData: unknown) => void): void {
  // Define event handlers to make sure, message handler will work correctly.
  defineEventHandlers();

  // We expect Telegram to send us new event through "message" event.
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) {
      return;
    }

    try {
      const { eventType, eventData } = parseMessage(event.data);
      cb(eventType, eventData);
    } catch {
      // We ignore incorrect messages as they could be generated by any other code.
    }
  });
}
