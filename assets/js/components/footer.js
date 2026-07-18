/*
===========================================
FINOVA ACCOUNTING SYSTEM
Footer Component
Version : 1.0.0
===========================================
*/

export class FinovaFooter {

    constructor() {

        this.render();

    }

    render() {

        const footer =
            document.getElementById("finova-footer");

        if (!footer) return;

        const year = new Date().getFullYear();

        footer.innerHTML = `

            <div class="finova-footer">

                <div class="finova-footer-left">

                    <span class="finova-copyright">

                        © ${year} FINOVA Accounting System

                    </span>

                </div>

                <div class="finova-footer-right">

                    <span class="finova-version">

                        Version 1.0.0

                    </span>

                </div>

            </div>

        `;

    }

}