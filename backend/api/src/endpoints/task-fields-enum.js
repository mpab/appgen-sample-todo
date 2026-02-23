const express = require('express');
const app = express();
const db = require('../database');
const response = require('../response');

// CRUD API
const apiPath = "/TaskFieldsEnum"

// Create
app.post(apiPath, async (req, res) => {
    let request = `create TaskFieldsEnum`;
    try {
        const sql_get_index = "select pg_get_serial_sequence('task_fields_enum', 'task_fields_enum_id')";
        const index_result = await db.query(sql_get_index);
        const index_name = index_result.rows[0]['pg_get_serial_sequence'];
        const sql_reset_idx = `select setval('${index_name}',(select max(task_fields_enum_id) from task_fields_enum))`;
        console.log(await db.query(sql_reset_idx));
        const { task_fields_enum } = req.body;
        const sql_create_item = `insert into task_fields_enum ("task_fields_enum") values ('${task_fields_enum}') returning *;`;
        console.log(sql_create_item);
        const results = await db.query(sql_create_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ALL
// http://localhost:3000/api/TaskFieldsEnum
module.exports = app.get(apiPath, async (req, res) => {
    let request = `read TaskFieldsEnum`;
    try {
        const sql_read = `select * from task_fields_enum order by "task_fields_enum_id";`;
        console.log(sql_read);
        const results = await db.query(sql_read);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ID
// http://localhost:3000/api/TaskFieldsEnum/1
module.exports = app.get(apiPath + "/:task_fields_enum_id", async (req, res) => {
    let request = `read TaskFieldsEnum/task_fields_enum_id`;
    try {
        const { task_fields_enum_id } = req.params;
        request = `read TaskFieldsEnum/${task_fields_enum_id}`;
        const sql_read_item = `select * from task_fields_enum where "task_fields_enum_id" = ${task_fields_enum_id};`;
        console.log(sql_read_item);
        const results = await db.query(sql_read_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Update
module.exports = app.put(apiPath, async (req, res) => {
    let request = `update TaskFieldsEnum`;
    try {
        const { task_fields_enum_id } = req.body;
        const { task_fields_enum } = req.body;
        request = `update TaskFieldsEnum/${task_fields_enum_id}`;
        const sql_update_item = `update task_fields_enum set "task_fields_enum"='${task_fields_enum}' where "task_fields_enum_id" = ${task_fields_enum_id} returning *;`;
        console.log(sql_update_item);
        const results = await db.query(sql_update_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Delete
module.exports = app.delete(apiPath + "/:task_fields_enum_id", async (req, res) => {
    let request = `delete TaskFieldsEnum`;
    try {
        const { task_fields_enum_id } = req.params;
        request = `delete TaskFieldsEnum/${task_fields_enum_id}`;
        const sql_delete_item = `delete from task_fields_enum where "task_fields_enum_id" = ${task_fields_enum_id};`;
        console.log(sql_delete_item);
        const results = await db.query(sql_delete_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});
