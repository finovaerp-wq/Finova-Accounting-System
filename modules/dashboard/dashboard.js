/*
===========================================
FINOVA ACCOUNTING SYSTEM
Dashboard Module
Version : 1.0.0
===========================================
*/

export class Dashboard {

    constructor() {

        this.initialize();

    }

    initialize() {

        console.log("Dashboard Initialized");

        this.loadSummary();

        this.loadRecentActivity();

        this.bindEvents();

    }

    /*
    ===========================================
        SUMMARY
    ===========================================
    */

    loadSummary() {

        this.setValue("Account Payable", 0);

        this.setValue("Account Receivable", 0);

        this.setValue("GL Journal", 0);

        this.setValue("Business Partner", 0);

    }

    /*
    ===========================================
        RECENT ACTIVITY
    ===========================================
    */

    loadRecentActivity() {

        console.log("Recent Activity Loaded");

    }

    /*
    ===========================================
        EVENTS
    ===========================================
    */

    bindEvents() {

        console.log("Dashboard Event Ready");

    }

    /*
    ===========================================
        UTILITIES
    ===========================================
    */

    setValue(title, value) {

        console.log(title + " : " + value);

    }

}