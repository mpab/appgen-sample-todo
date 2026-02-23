const express = require('express');
const app = express();
const db = require('../database');
const response = require('../response');

// API
const apiPath = "/Task"
const selfNavPath = `/api${apiPath}/`

const API_UUID = "30125261-A5CA-48E4-997E-3935C07BED5D"

// ---------------------------------------------------------------------------------------------------------------------------------------
// NAVIGATION/PAGING

// helper functions

const retPagingData = (entities, pageSize) => {
    return {
        entities: entities,
        page_size: parseInt(pageSize), //entities.rows.length,
        prev_cursor: entities.rows[0].task_id,
        next_cursor: entities.rows.at(-1).task_id
    };
}

const getPagingDataByPageSize = async (pageSize, pageCursor) => {
    const entities = await db.query(`select * from task where "task_id" > ${pageCursor} order by task_id limit ${pageSize};`);
    return retPagingData(entities, pageSize);
}

const getPagingDataByPageSizePrevCursor = async (pageSize, pageCursor) => {
    const entities = await db.query(`select * from (select * from task where "task_id" < ${pageCursor} order by task_id desc limit ${pageSize}) order by task_id;`);
    return retPagingData(entities, pageSize);
}

const getPagingDataByPageSizeLastCursor = async (pageSize, pageCursor, entityCount) => {
    let window = entityCount % pageSize;
    if (!window) window = pageSize;

    const entities = await db.query(`select * from (select * from task where "task_id" <= ${pageCursor} order by task_id desc limit ${window}) order by task_id;`);

    let pd = retPagingData(entities, pageSize);
    pd.isLastPage = true; // signal that next page link should be removed
    return pd;
}

const getPagingDataByPageSizeFirstCursor = async (pageSize, pageCursor) => {
    const entities = await db.query(`select * from task where "task_id" >= ${pageCursor} order by task_id limit ${pageSize};`);
    return retPagingData(entities, pageSize);
}

const getPagingDataByCursor = async (pageStartCursor, pageEndCursor) => {
    const entities = await db.query(`select * from task where "task_id" >= ${pageStartCursor} and "task_id" <= ${pageEndCursor} order by task_id;`);
    return retPagingData(entities, entities.rows.length);
}

const getFirstEntity = async () => {
    let result = await db.query(`select * from task order by task_id asc limit 1;`);
    return result.rows[0];
}

const getLastEntity = async () => {
    let result = await db.query(`select * from task order by task_id desc limit 1;`);
    return result.rows[0];
}

const getEntityCount = async () => {
    let result = await db.query(`select count(*) from task;`);
    return parseInt(result.rows[0].count);
}

const enrichPagingData = async (pagingData) => {
    const firstEntity = await getFirstEntity();
    pagingData.first_cursor = parseInt(firstEntity.task_id); // start of data
    const lastEntity = await getLastEntity();
    pagingData.last_cursor = parseInt(lastEntity.task_id);
    const entityCount = await getEntityCount();
    pagingData.entity_count = entityCount;
    pagingData._links = makeLinks(pagingData);
    return pagingData;
}

const makeResult = async (pagingData) => {
        const [
            assignee_enum,
            status_enum,
            task_fields_enum
        ] = await Promise.all([
            await db.query(`select * from assignee_enum order by "assignee_enum_id";`),
            await db.query(`select * from status_enum order by "status_enum_id";`),
            await db.query(`select array(select task_fields_enum from task_fields_enum order by "task_fields_enum_id");`)
        ]);

    return {
        version: {
            shape: API_UUID,
            major: 0,
            minor: 0,
            revision: 1
        },
        entities: pagingData.entities.rows,
            entity_fields: task_fields_enum.rows[0].array,
            references: {
                assignee_enum: assignee_enum.rows,
                status_enum: status_enum.rows
            },
        _links: pagingData._links,
        _paging: {
            entity_count: pagingData.entity_count,
            page_size: pagingData.page_size,
            prev_cursor: pagingData.prev_cursor,
            next_cursor: pagingData.next_cursor,
            first_cursor: pagingData.first_cursor,
            last_cursor: pagingData.last_cursor
        }
    };
}

const makeLinks = (pagingData) => {
    const self = `${selfNavPath}?page_size=${pagingData.page_size}&prev_cursor=${pagingData.prev_cursor}&next_cursor=${pagingData.next_cursor}`;
    let next = `${selfNavPath}?page_size=${pagingData.page_size}&next_cursor=${pagingData.next_cursor}`;
    let prev = `${selfNavPath}?page_size=${pagingData.page_size}&prev_cursor=${pagingData.prev_cursor}`;
    const first = `${selfNavPath}?page_size=${pagingData.page_size}&first_cursor=${pagingData.first_cursor}`;
    const last = `${selfNavPath}?page_size=${pagingData.page_size}&last_cursor=${pagingData.last_cursor}`;

    // remove invalid links
    if (pagingData.prev_cursor <= pagingData.first_cursor) prev = '';
    if (pagingData.isLastPage || pagingData.next_cursor >= pagingData.last_cursor) next = '';

    return {
        self: self,
        next: next,
        prev: prev,
        first: first,
        last: last
    }
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// CRUD API

// ---------------------------------------------------------------------------------------------------------------------------------------
// Create (and reset index)
app.post(apiPath, async (req, res) => {
    let request = `create Task`;
    try {
        const sql_get_index = "select pg_get_serial_sequence('task', 'task_id')";
        const index_result = await db.query(sql_get_index);
        const index_name = index_result.rows[0]['pg_get_serial_sequence'];
        const sql_reset_idx = `select setval('${index_name}',(select max(task_id) from task))`;
        console.log(await db.query(sql_reset_idx));
        const { task } = req.body;
        const { assignee_enum_id } = req.body;
        const { due_date } = req.body;
        const { status_enum_id } = req.body;
        const sql_create_item = `insert into task ("task","assignee_enum_id","due_date","status_enum_id") values ('${task}','${assignee_enum_id}','${due_date}','${status_enum_id}') returning *;`;
        console.log(sql_create_item);
        const results = await db.query(sql_create_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// Read ALL, including constraints
// http://localhost:3000/api/Task
module.exports = app.get(apiPath, async (req, res) => {
    let request = `be4fe: read all Task`;
    try {
        const pageSize = req.query.page_size ? req.query['page_size'] : 5;
        let pd;
        if (req.query.prev_cursor && req.query.next_cursor ) {
            const prev_cursor = parseInt(req.query.prev_cursor);
            const next_cursor = parseInt(req.query.next_cursor);
            pd = await getPagingDataByCursor(prev_cursor, next_cursor);
        } else if (req.query.next_cursor) {
            const cursor = parseInt(req.query.next_cursor);
            pd = await getPagingDataByPageSize(pageSize, cursor);
        } else if (req.query.prev_cursor) {
            const cursor = parseInt(req.query.prev_cursor);
            pd = await getPagingDataByPageSizePrevCursor(pageSize, cursor);
        } else if (req.query.first_cursor) {
            const cursor = parseInt(req.query.first_cursor);
            pd = await getPagingDataByPageSizeFirstCursor(pageSize, cursor);
        } else if (req.query.last_cursor) {
            const cursor = parseInt(req.query.last_cursor);
            const entityCount = await getEntityCount();
            pd = await getPagingDataByPageSizeLastCursor(pageSize, cursor, entityCount);
        } else {
            pd = await getPagingDataByPageSize(pageSize, -1); // initial data set
        }
        const epd = await enrichPagingData(pd);
        result = await makeResult(epd);
        response.success(res, result, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// Read ID
// http://localhost:3000/api/Task/1
module.exports = app.get(apiPath + "/:task_id", async (req, res) => {
    let request = `read Task/task_id`;
    try {
        const { task_id } = req.params;
        request = `read Task/${task_id}`;
        const sql_read_item = `select * from task where "task_id" = ${task_id};`;
        console.log(sql_read_item);
        const results = await db.query(sql_read_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// Update
module.exports = app.put(apiPath, async (req, res) => {
    let request = `update Task`;
    try {
        const { task_id } = req.body;
        const { task } = req.body;
        const { assignee_enum_id } = req.body;
        const { due_date } = req.body;
        const { status_enum_id } = req.body;
        request = `update Task/${task_id}`;
        const sql_update_item = `update task set "task"='${task}',"assignee_enum_id"='${assignee_enum_id}',"due_date"='${due_date}',"status_enum_id"='${status_enum_id}' where "task_id" = ${task_id} returning *;`;
        console.log(sql_update_item);
        const results = await db.query(sql_update_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// Delete
module.exports = app.delete(apiPath + "/:task_id", async (req, res) => {
    let request = `delete Task`;
    try {
        const { task_id } = req.params;
        request = `delete Task/${task_id}`;
        const sql_delete_item = `delete from task where "task_id" = ${task_id};`;
        console.log(sql_delete_item);
        const results = await db.query(sql_delete_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});
