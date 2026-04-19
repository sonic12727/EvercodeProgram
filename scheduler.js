const { appName, settings } = require('./config');
const createLogger = require('./logger');

const log = createLogger(appName);

log('scheduler.js started');

function scheduleTask(name, interval, task) {
  log(`Task "${name}" scheduled every ${interval} ms`);

  return setInterval(() => {
    log(`Task "${name}" started`);
    task();
  }, interval);
}

scheduleTask('running-task', settings.schedulerIntervalMs, () => {
  log('running');
});

module.exports = {
  scheduleTask
};
