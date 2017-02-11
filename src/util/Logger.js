/**
 * Enum that represents the different types of messages.
 * @enum {string}
 */
const LogType = {
  Log: 'log',
  Error: 'error',
  Warn: 'warn',
  Info: 'info'
};

/**
 * Logs different types of messages to console.
 * @param {*} message
 * @param {LogType} type
 */
const log = (message, type) => console[type || 'log'](message);

export { LogType, log as default };
