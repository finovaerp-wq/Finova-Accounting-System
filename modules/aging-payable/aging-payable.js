/*
==========================================================
FINOVA ACCOUNTING SYSTEM
AGING PAYABLE MODULE
Version : 1.0.0
==========================================================
*/

class AgingPayable {

    constructor() {

        console.log(
            "Aging Payable Initialized"
        );

    }

    async initialize() {

        try {

            console.log(
                "Aging Payable Ready"
            );

        }

        catch (error) {

            console.error(error);

        }

    }

}

/*
==========================================================
EXPORT
==========================================================
*/

window.AgingPayable = AgingPayable;