function createLogger(appName) {
  return function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${appName}] [${timestamp}] ${message}`);
  };
}

module.exports = createLogger;
