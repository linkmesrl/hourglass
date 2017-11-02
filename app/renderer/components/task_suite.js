"use strict";

const EventEmitter = require('events');

const TaskCard = require('./task_card');
const AddTask = require('./add_task');
const AppStatus = require('../app_status');
const TaskConfig = require('../task_config');

module.exports = {
    props: ['suite', 'index'],
    data: () => {
        return {
            AppStatus: AppStatus,
            event: new EventEmitter()
        };
    },
    template: `
        <div v-bind:id="id" class="suite-tab">
            <ul class="collapsible" data-collapsible="accordion">
                <template v-for="(task,i) in suite.tasks">
                    <task-card v-bind:task="task" v-on:remove="removeTask(i)" v-on:edit="editTask(i, $event)" v-bind:event="event"></task-card>
                </template>
            </ul>
            <add-task v-on:add="addTask"></add-task>
        </div>
    `,
    mounted() {
        AppStatus.events.on("run-suite", this.onRunSuite);
        AppStatus.events.on("stop-suite", this.onStopSuite);
    },
    beforeDestroy() {
        AppStatus.events.removeListener("run-suite", this.onRunSuite);
        AppStatus.events.removeListener("stop-suite", this.onStopSuite);
    },
    methods: {
        addTask: function(task) {
            if (this.suite.length < AppStatus.maxTasksPerSuite) {
                this.suite.addTask(task);
            }
            TaskConfig.saveConfig();
        },
        removeTask: function(i) {
            this.suite.removeTask(i);
            this.$forceUpdate();
        },
        editTask: function(i, task) {
            this.suite.replaceTask(i, task);
            this.$forceUpdate();
        },
        onRunSuite() {
            if (this.index === AppStatus.activeSuite) {
                this.event.emit("run");
            }
        },
        onStopSuite() {
            if (this.index === AppStatus.activeSuite) {
                this.event.emit("stop");
            }
        }
    },
    computed: {
        id: function() {
            return "tab" + this.index;
        },
        showAddTab: function() {
            return AppStatus.editMode && this.suite.length < AppStatus.maxTasksPerSuite;
        }

    },
    components: {
        "task-card": TaskCard,
        "add-task": AddTask
    }
};
