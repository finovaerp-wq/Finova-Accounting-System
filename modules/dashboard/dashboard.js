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

    this.startClock();

    this.loadSystemInformation();

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
    REAL TIME CLOCK
===========================================
*/

startClock() {

    const element =
        document.getElementById(
            "dashboard-current-time"
        );

    if (!element) {

        return;

    }

    const updateClock = () => {

        const now = new Date();

        const date = now.toLocaleDateString(

            "en-US",

            {

                weekday: "long",

                year: "numeric",

                month: "long",

                day: "numeric"

            }

        );

        const time = now.toLocaleTimeString(

            "en-US",

            {

                hour: "2-digit",

                minute: "2-digit",

                second: "2-digit",

                hour12: true

            }

        );

       element.innerHTML = `

    <div class="finova-system-date">

        ${date}

    </div>

    <div class="finova-system-time">

        ${time}

    </div>

`;

    };

    updateClock();

    setInterval(

        updateClock,

        1000

    );

}
/*
===========================================
    SYSTEM INFORMATION
===========================================
*/

loadSystemInformation() {

    const period = document.getElementById(

        "dashboard-period"

    );

    const branch = document.getElementById(

        "dashboard-branch"

    );

    const currency = document.getElementById(

        "dashboard-currency"

    );

    if (period) {

        period.textContent = "June 2026";

    }

    if (branch) {

        branch.textContent = "Jakarta Branch";

    }

    if (currency) {

        currency.textContent = "IDR";

    }

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