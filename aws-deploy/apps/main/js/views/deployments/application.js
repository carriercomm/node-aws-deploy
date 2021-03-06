DeploymentApplicationView = AwsDeploy.View.extend({
    initialize: function () {
        this.template = Templates.get("main/deployment-application");

        this.application = new DeploymentApplicationModel();
        this.application.deployment_id = this.model.id;
        this.listenTo(this.application, 'change', this.onApplication);
        this.application.fetch({
            success: _.bind(function () {
                this.setInterval(this.application.fetch, 15000, this.application);
            }, this)
        });
    },

    events: {
        "change #application_name": "refreshEnvironments",
        "click #link": "link",
        "click #unlink": "unlink",
        "click #deploy": "showDeployDialog",
        "click #refresh": "refresh",
        "click #restart": "restart"
    },

    render: function () {
        this.$el.html(this.template());
        this.delegateEvents();
        this.$el.find("#deploy").prop("disabled", !(this.application.get("application_status") != "processing"));
        return this;
    },

    onApplication: function () {
        if (!this.application.get("application_name") || !this.application.get("application_environment") || !this.application.get("application_bucket")) {
            this.refreshApplications();
            this.refreshEnvironments();
            this.refreshBuckets();
        }

        this.render();
    },

    refreshApplications: function () {
        if (this.applications && this.applications.length) {
            return;
        }

        this.applications = new AwsApplicationCollection();
        this.applications.fetch({
            success: _.bind(function (collection) {
                var target = this.$el.find("datalist#applications");
                collection.each(function (app) {
                    $("<option>").attr("value", app.get("application_name")).html(app.get("application_description")).appendTo(target);
                });
            }, this)
        });
    },

    refreshEnvironments: function () {
        var application_name = this.$el.find("#application_name").val();
        if (!application_name || (this.environments && (this.environments.application_name == application_name))) {
            return;
        }

        this.environments = new AwsEnvironmentCollection();
        this.environments.application_name = application_name;
        this.environments.fetch({
            success: _.bind(function (collection) {
                var target = this.$el.find("datalist#environments");
                collection.each(function (env) {
                    $("<option>").attr("value", env.get("environment_id")).html(env.get("environment_name")).appendTo(target);
                });
            }, this)
        });
    },

    refreshBuckets: function () {
        this.buckets = new AwsS3BucketCollection();
        this.buckets.fetch({
            success: _.bind(function (collection) {
                var target = this.$el.find("datalist#buckets");
                collection.each(function (bucket) {
                    $("<option>").attr("value", bucket.get("bucket_name")).html(bucket.get("bucket_name")).appendTo(target);
                });
            }, this)
        })
    },

    link: function (event) {
        event.preventDefault();

        var application_name = this.$el.find("#application_name").val();
        var application_environment = this.$el.find("#application_environment").val();
        var application_bucket = this.$el.find("#application_bucket").val();

        this.application.emit("link", {
            application_name: application_name,
            application_environment: application_environment,
            application_bucket: application_bucket
        }, {
            success: _.bind(function () {
                toastr.success(i18n.t("application.link-success"));
                this.application.fetch();
            }, this),
            error: function () {
                toastr.error(i18n.t("application.link-failed"));
            }
        });
    },

    unlink: function (event) {
        event.preventDefault();

        this.confirm("application.unlink-confirm", function (ok) {
            if (ok) {
                this.application.emit("unlink", {
                    success: _.bind(function () {
                        toastr.success(i18n.t("application.unlink-success"));
                        this.application.fetch();
                    }, this),
                    error: function () {
                        toastr.error(i18n.t("application.unlink-failed"));
                    }
                });
            }
        });
    },

    showDeployDialog: function () {
        this.modalView(new DeploymentApplicationDeployDialogView({model: this.application}));
    },

    restart: function () {
        this.confirm("application.restart-confirm", function (ok) {
            if (ok) {
                this.application.emit('restart', {}, {
                    success: _.bind(function () {
                        toastr.success(i18n.t("application.restart-success"));
                    }, this),
                    error: _.bind(function () {
                        toastr.error(i18n.t("application.restart-failed"));
                    }, this)
                })
            }
        });
    },

    refresh: function () {
        this.application.emit('refresh', {}, {
            success: _.bind(function () {
                this.application.fetch();
            }, this)
        });
    }
});

DeploymentApplicationDeployDialogView = AwsDeploy.View.extend({
    initialize: function () {
        this.template = Templates.get("main/deployment-application-deploy-dialog");
        this.listenTo(this.model, 'change', this.render);

        this.versions = new DeploymentApplicationVersionCollection();
        this.versions.deployment_id = this.model.id;

        this.keyToggle = _.bind(this.keyToggle, this);
        this.shiftKey = false;

        $(document).bind('keydown', this.keyToggle);
        $(document).bind('keyup', this.keyToggle);

        this.versions.fetch({
            reset: true,
            success: _.bind(function (collection) {
                var target = this.$el.find("select#version_label");
                target.prop('disabled', false);

                collection.each(function (version) {
                    $("<option>").attr("value", version.get("version_label")).html(version.get("version_label")).appendTo(target);
                });
                target.val(this.model.get("application_version"));
                this.$el.find("button[type=submit]").prop('disabled', target.val() == this.model.get("application_version"));
            }, this)
        });
    },

    events: {
        "submit form": "submit",
        "change #version_label": "change"
    },

    change: function () {
        this.update();
    },

    update: function (force) {
        var target = this.$el.find("select#version_label");
        this.$el.find("button[type=submit]").prop('disabled', (target.val() == this.model.get("application_version")) && !force);
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.delegateEvents();
        return this;
    },

    submit: function (event) {
        event.preventDefault();

        var version_label = this.$el.find("#version_label").val();

        this.$el.find("#progress").removeClass('hidden');
        this.$el.find('button[type=submit]').prop('disabled', true);
        this.model.emit('deploy-version', {
            version_label: version_label
        }, {
            success: _.bind(function () {
                toastr.success(i18n.t('application.deploy-success'));
                this.close();
            }, this),
            error: _.bind(function () {
                toastr.error(i18n.t('application.deploy-failed'));
                this.$el.find("#progress").addClass('hidden');
                this.$el.find('button[type=submit]').prop('disabled', false);
            }, this)
        });
    },

    keyToggle: function (event) {
        if (event.shiftKey == this.shiftKey) {
            return;
        }
        if (event.shiftKey && event.currentTarget != document) {
            return;
        }
        this.shiftKey = event.shiftKey;
        this.update(this.shiftKey);
    },

    onClose: function () {
        $(document).unbind("keydown", this.keyToggle);
        $(document).unbind("keyup", this.keyToggle);
    }
});