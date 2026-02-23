// Purpose: return a standard json response shape

exports.success = (res, result, message) => {
    let response = {
        status: "success",
        message: message,
        result: result
    };
    console.log(response);
    res.json(response);
}

// Note: errors are specific to postgres
exports.error = (res, result, message) => {
    let response = {
        status: "error",
        message: message,
        result: result
    };

    switch (result['code']) {
        case 'ECONNREFUSED':
            response.status = "error - no database connection";
            break;
        case 'ENOTFOUND':
            response.status = "error - invalid database";
            break;
        case '42P01':
            response.status = "error - invalid entity";
            break;
        case '42703':
            response.status = "error - invalid attribute";
            break;
        case '22P02':
            response.status = "error - invalid data";
            break;
        case '0A000':
            response.status = "error - multiple entity update required";
            break;
        case '23503':
            response.status = "error - reference violation";
            break;
        case '23505':
            response.status = "error - duplicate data";
            break;
        case '42601':
            response.status = "error - sql syntax";
            break;
    }

    console.error(response);
    res.json(response);
}