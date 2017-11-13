"use strict";

const Suite = require('../suite');
const Material = require('../materialize');
const AppStatus = require('../app_status');

const NavbarMenu = require('./navbar_menu');
const WindowFrameTop = require('./window_frame_top');
const TaskConfig = require('../task_config');

const TrelloApi = require('../../common/trello.js');

module.exports = {
    props: ['suites'],
    components: {
        "navbar-menu": NavbarMenu,
        "window-frame-top": WindowFrameTop
    },
    data: () => {
        return {
            AppStatus: AppStatus
        };
    },
    // <li><a href="#addTaskModal" v-on:click="openAddTaskModal"><i class="material-icons unselectable-text">add</i></a></li>
    // <li><a v-on:click="toggleEdit" v-bind:class="{'edit-button-active': editMode}"><i class="material-icons unselectable-text">mode_edit</i></a></li>
    template: `
    <div>
        <div class="navbar-fixed">
            <nav class="nav-extended">
                <div class="nav-wrapper">
                    <window-frame-top></window-frame-top>
                    <div class="brand-logo main-logo left">
                    <img class="logo-icon" src="resources/logos/gaucho_logo.png"></img>
                    <a>LinkMe</a>
                    </div>
                    <ul class="right">
                        <li><a v-on:click="sendWeekReport"><i class="material-icons unselectable-text">send</i></a></li>
                        <li><a v-on:click="logoutTrello"><i class="material-icons unselectable-text">power_settings_new</i></a></li>
                    </ul>
                    <navbar-menu v-on:selection="onMenuSelection" v-bind:suites="suites"></navbar-menu>
                    <div class="row tabs-row">
                        <ul id="navbar-tabs" class="tabs tabs-transparent">
                            <template v-for="(suite,index) in suites">
                            <li class="tab col s3 unselectable-text">
                                <a draggable="false" v-on:click="onTabSelected(index)" v-bind:href="'#tab'+index" v-bind:class="{ active: index===0 }">
                                    <span class="tab-text">{{suite.title}}</span>
                                </a>
                            </li>
                            </template>
                        </ul>
                    </div>
                    <div class="row tabs-row">
                        <ul id="week-days-tabs" class="tabs">
                            <template v-for="(day,index) in AppStatus.weekDays">
                                <li class="tab col s3 unselectable-text">
                                    <a draggable="false" v-on:click="onDaySelected(index)" v-bind:class="{ active: index===AppStatus.activeDay }">
                                        <span class="tab-text">{{day}}</span>
                                    </a>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </div>
    `,
    methods: {
        addSuite() {
            if (this.suites.length < AppStatus.maxSuites) {
                this.suites.push(new Suite("Suite " + (this.suites.length + 1)));
                this.selectTab(this.suites.length - 1);
            }
        },
        deleteSuite() {
            if (this.suites.length > 1) {
                this.suites[AppStatus.activeSuite].stopAll();
                this.suites.splice(AppStatus.activeSuite, 1);
                this.selectTab(AppStatus.activeSuite);
            }
            TaskConfig.saveConfig();
        },
        onTabSelected(index) {
            AppStatus.activeSuite = index;
        },
        selectTab(index) {
            if (index >= this.suites.length) index = this.suites.length - 1;
            this.$nextTick(() => {
                Material.selectTab("#navbar-tabs", 'tab' + index);
                AppStatus.activeSuite = index;
            });
        },
        toggleEdit() {
            AppStatus.toggleEdit();
        },
        openAddTaskModal() {
            $('#addTaskModal').modal();
            $('#listSelect').material_select();
        },
        onMenuSelection(selection) {
            switch (selection) {
                case "add-suite":
                    this.addSuite();
                    break;
                case "delete-suite":
                    this.deleteSuite();
                    break;
                default:
                    this.AppStatus.events.emit(selection);
            }
        },
        logoutTrello() {
            TrelloApi.methods.trelloLogout();
        },
        sendWeekReport() {
            console.log("send report")
        },
        onDaySelected(index) {
            this.suites[AppStatus.activeSuite].tasks.forEach((value) => {
                value.elapsedTime = value.savedElapsedTimes[index];
            });
            AppStatus.activeDay = index;
        }
    },
    computed: {
        currentSuite() {
            return this.suites[AppStatus.activeSuite];
        },
        editMode() {
            return AppStatus.editMode;
        }
    }
};
