const expose = require('./index');

// Info Endpoint - requires no database
expose(require('./endpoints/info.js'));
// ---------------------------------------------------------------------------

expose(require('./endpoints/assignee-enum'));
expose(require('./endpoints/status-enum'));
expose(require('./endpoints/task-fields-enum'));
expose(require('./endpoints/task'));
