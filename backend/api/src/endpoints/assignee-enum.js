const express = require('express');
const app = express();
const db = require('../database');
const response = require('../response');

// CRUD API
const apiPath = "/AssigneeEnum"

// Create
app.post(apiPath, async (req, res) => {
    let request = `create AssigneeEnum`;
    try {
        const sql_get_index = "select pg_get_serial_sequence('assignee_enum', 'assignee_enum_id')";
        const index_result = await db.query(sql_get_index);
        const index_name = index_result.rows[0]['pg_get_serial_sequence'];
        const sql_reset_idx = `select setval('${index_name}',(select max(assignee_enum_id) from assignee_enum))`;
        console.log(await db.query(sql_reset_idx));
        const { assignee_enum } = req.body;
        const sql_create_item = `insert into assignee_enum ("assignee_enum") values ('${assignee_enum}') returning *;`;
        console.log(sql_create_item);
        const results = await db.query(sql_create_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ALL
// http://localhost:3000/api/AssigneeEnum
module.exports = app.get(apiPath, async (req, res) => {
    let request = `read AssigneeEnum`;
    try {
        const sql_read = `select * from assignee_enum order by "assignee_enum_id";`;
        console.log(sql_read);
        const results = await db.query(sql_read);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ID
// http://localhost:3000/api/AssigneeEnum/1
module.exports = app.get(apiPath + "/:assignee_enum_id", async (req, res) => {
    let request = `read AssigneeEnum/assignee_enum_id`;
    try {
        const { assignee_enum_id } = req.params;
        request = `read AssigneeEnum/${assignee_enum_id}`;
        const sql_read_item = `select * from assignee_enum where "assignee_enum_id" = ${assignee_enum_id};`;
        console.log(sql_read_item);
        const results = await db.query(sql_read_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Update
module.exports = app.put(apiPath, async (req, res) => {
    let request = `update AssigneeEnum`;
    try {
        const { assignee_enum_id } = req.body;
        const { assignee_enum } = req.body;
        request = `update AssigneeEnum/${assignee_enum_id}`;
        const sql_update_item = `update assignee_enum set "assignee_enum"='${assignee_enum}' where "assignee_enum_id" = ${assignee_enum_id} returning *;`;
        console.log(sql_update_item);
        const results = await db.query(sql_update_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Delete
module.exports = app.delete(apiPath + "/:assignee_enum_id", async (req, res) => {
    let request = `delete AssigneeEnum`;
    try {
        const { assignee_enum_id } = req.params;
        request = `delete AssigneeEnum/${assignee_enum_id}`;
        const sql_delete_item = `delete from assignee_enum where "assignee_enum_id" = ${assignee_enum_id};`;
        console.log(sql_delete_item);
        const results = await db.query(sql_delete_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});
