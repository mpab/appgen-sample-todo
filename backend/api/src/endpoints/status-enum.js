const express = require('express');
const app = express();
const db = require('../database');
const response = require('../response');

// CRUD API
const apiPath = "/StatusEnum"

// Create
app.post(apiPath, async (req, res) => {
    let request = `create StatusEnum`;
    try {
        const sql_get_index = "select pg_get_serial_sequence('status_enum', 'status_enum_id')";
        const index_result = await db.query(sql_get_index);
        const index_name = index_result.rows[0]['pg_get_serial_sequence'];
        const sql_reset_idx = `select setval('${index_name}',(select max(status_enum_id) from status_enum))`;
        console.log(await db.query(sql_reset_idx));
        const { status_enum } = req.body;
        const sql_create_item = `insert into status_enum ("status_enum") values ('${status_enum}') returning *;`;
        console.log(sql_create_item);
        const results = await db.query(sql_create_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ALL
// http://localhost:3000/api/StatusEnum
module.exports = app.get(apiPath, async (req, res) => {
    let request = `read StatusEnum`;
    try {
        const sql_read = `select * from status_enum order by "status_enum_id";`;
        console.log(sql_read);
        const results = await db.query(sql_read);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Read ID
// http://localhost:3000/api/StatusEnum/1
module.exports = app.get(apiPath + "/:status_enum_id", async (req, res) => {
    let request = `read StatusEnum/status_enum_id`;
    try {
        const { status_enum_id } = req.params;
        request = `read StatusEnum/${status_enum_id}`;
        const sql_read_item = `select * from status_enum where "status_enum_id" = ${status_enum_id};`;
        console.log(sql_read_item);
        const results = await db.query(sql_read_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Update
module.exports = app.put(apiPath, async (req, res) => {
    let request = `update StatusEnum`;
    try {
        const { status_enum_id } = req.body;
        const { status_enum } = req.body;
        request = `update StatusEnum/${status_enum_id}`;
        const sql_update_item = `update status_enum set "status_enum"='${status_enum}' where "status_enum_id" = ${status_enum_id} returning *;`;
        console.log(sql_update_item);
        const results = await db.query(sql_update_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});

// Delete
module.exports = app.delete(apiPath + "/:status_enum_id", async (req, res) => {
    let request = `delete StatusEnum`;
    try {
        const { status_enum_id } = req.params;
        request = `delete StatusEnum/${status_enum_id}`;
        const sql_delete_item = `delete from status_enum where "status_enum_id" = ${status_enum_id};`;
        console.log(sql_delete_item);
        const results = await db.query(sql_delete_item);
        response.success(res, results.rows, request);
    } catch (err) {
        response.error(res, err, request);
    }
});
