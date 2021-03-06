var debug = require('debug')('aws-deploy:task:clean-application-versions');
var _ = require('lodash');
var async = require('async');

var db = require('../db');
var AWS = require('../aws-sdk');
var log = require('../log');

var EB = new AWS.ElasticBeanstalk();

function deployApplicationVersion(data, callback) {
    var application;
    async.series([
        function (callback) {
            db.querySingle("SELECT * FROM awd_deployments" +
                " JOIN awd_applications ON awd_applications.deployment_id = awd_deployments.deployment_id" +
                " WHERE awd_deployments.deployment_id = ? LIMIT 1", [data.deployment_id], function (err,result) {
                if (err || !result) {
                    callback(err || new SchemaError("Application not found"));
                    return;
                }

                application = result;
                callback(null);
            });
        }, function (callback) {
            EB.updateEnvironment({
                EnvironmentId: application.application_environment,
                VersionLabel: data.version_label
            }, function (err, data) {
                if (err) {
                    log.send(application.deployment_id, 'error', 'application.deploy-failed', {
                        "environment_id": data.EnvironmentId,
                        "version_label": data.VersionLabel,
                        "error": err
                    });
                } else {
                    log.send(application.deployment_id, 'info', 'application.deploy-success', {
                        "environment_id": data.EnvironmentId,
                        "version_label": data.VersionLabel
                    });
                }
                callback(err);
            });
        }
    ], function (err) {
        callback(err);
    });

}

exports.run = deployApplicationVersion;
