const EventEmitter = require("events");

const pipelineEvents = new EventEmitter();
pipelineEvents.setMaxListeners(200);

const emitPipelineUpdate = (payload) => {
  pipelineEvents.emit("pipeline:update", payload);
};

const onPipelineUpdate = (handler) => {
  pipelineEvents.on("pipeline:update", handler);
  return () => pipelineEvents.off("pipeline:update", handler);
};

module.exports = {
  emitPipelineUpdate,
  onPipelineUpdate,
};
