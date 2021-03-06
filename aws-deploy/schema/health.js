var async = require('async');

var schema = require('server-core').schema;
var schedule = require('../schedule');
var filters = require('../filters');
var db = require('../db');
var cache = require('../cache');

schema.on('create', '/deployments/:deployment_id/health',
    filters.authCheck, filters.deploymentWriteCheck,
function (deployment_id, data, callback) {
    db.query("INSERT INTO awd_healthchecks" +
    " (deployment_id, healthcheck_type, healthcheck_name, healthcheck_enabled, healthcheck_port, healthcheck_uri)" +
    " VALUES" +
    " (:deployment_id, :healthcheck_type, :healthcheck_name, :healthcheck_enabled, :healthcheck_port, :healthcheck_uri)", {
        deployment_id: deployment_id,
        healthcheck_type: data.healthcheck_type,
        healthcheck_name: data.healthcheck_name,
        healthcheck_enabled: data.healthcheck_enabled,
        healthcheck_port: data.healthcheck_port,
        healthcheck_uri: data.healthcheck_uri
    }, function (err) {
        if (err) {
            callback(err);
            return;
        }

        schedule.run('health-check', deployment_id, callback);
    });
});

schema.on('read', '/deployments/:deployment_id/health',
    filters.authCheck, filters.deploymentReadCheck,
function (deployment_id, callback) {
    db.query("SELECT * FROM awd_healthchecks" +
    " WHERE deployment_id = ?" +
    " ORDER BY healthcheck_name", [deployment_id], function (err, rows) {
        if (err) {
            callback(err);
            return;
        }

        rows.forEach(function (row) {
            var healthcheck_status = cache.get("healthcheck-status:" + row.healthcheck_id);
            row.healthcheck_status = healthcheck_status ? healthcheck_status : "unknown";
            row.healthcheck_response = cache.get("healthcheck-response:" + row.healthcheck_id);
        });

        callback(err, rows);
    });
});

schema.on('update', '/deployments/:deployment_id/health/:healthcheck_id',
    filters.authCheck, filters.deploymentWriteCheck,
function (deployment_id, healthcheck_id, data, callback) {
    db.query("UPDATE awd_healthchecks SET" +
    " healthcheck_type = :healthcheck_type," +
    " healthcheck_name = :healthcheck_name," +
    " healthcheck_enabled = :healthcheck_enabled," +
    " healthcheck_port = :healthcheck_port," +
    " healthcheck_uri = :healthcheck_uri" +
    " WHERE deployment_id = :deployment_id AND healthcheck_id = :healthcheck_id" +
    " LIMIT 1", {
        deployment_id: deployment_id,
        healthcheck_id: healthcheck_id,
        healthcheck_type: data.healthcheck_type,
        healthcheck_name: data.healthcheck_name,
        healthcheck_enabled: data.healthcheck_enabled,
        healthcheck_port: data.healthcheck_port,
        healthcheck_uri: data.healthcheck_uri
    }, function (err) {
        if (err) {
            callback(err);
            return;
        }

        cache.del("healthcheck-status:" + healthcheck_id);
        schedule.run('health-check', deployment_id, callback);
    });
});

schema.on('destroy', '/deployments/:deployment_id/health/:healthcheck_id',
    filters.authCheck, filters.deploymentWriteCheck,
function (deployment_id, healthcheck_id, callback) {
    db.query("DELETE FROM awd_healthchecks" +
    " WHERE deployment_id = ? AND healthcheck_id = ?" +
    " LIMIT 1", [deployment_id, healthcheck_id], function (err) {
        callback(err);
    });
});
