import {step} from "mocha-steps";
import {Constants} from "../../../../../common/constants";

xdescribe("Automate Generating Dockets", () => {

    const authorization = `bearer ${Cypress.env("token")}`;;

    step("Generating Dockets", () => {

        cy.request({
            method: 'POST',
            headers: {
                authorization: authorization,
            },
            url: '/production-planning-service/cut-docket-generation/generateDocketsForSubPo',
            body: {
                "subPo": `${Cypress.env('subPoNumber')}`,
                "userName": `${Cypress.env('userName')}`,
                "plantCode": `${Cypress.env('plantCode')}`
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body).has.property('internalMessage', Constants.PPS_GENERATE_DOCKETS_FOR_SUB_PO_MSG);
        });

        cy.request({
            method: 'POST',
            headers: {
                authorization: authorization,
            },
            url: '/production-planning-service/production-order-ratios/displayRatioComponentGroupsForSubPO',
            body: {
                "poNumber": `${Cypress.env('subPoNumber')}`
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', Constants.PPS_DISPLAY_RATIO_COMPONENT_GROUPS_FOR_SUB_PO);
        });

    });

    step("Get CutDocket Status For Sub Po Number", () => {
        let count = 0;
        const getCutDocketStatusForSubPoNumber = () => {

            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: '/production-planning-service/production-order/getCutDocketStatusForSubPoNumber',
                body: {
                    "poNumber": `${Cypress.env('subPoNumber')}`,
                    "plantCode": `${Cypress.env('plantCode')}`
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.equal(true);
                expect(response.body).has.property('internalMessage', Constants.PPS_GET_CUT_DOCKET_STATUS_FOR_SUB_PO_NO_MSG);
                //cy.task('log', response.body);
                cy.wait(500);
                if (response.body.data.docsGenerated !== Constants.PPS_DOCKET_GEN_DONE) {
                    count++;
                    if (count < Constants.MAX_ATTEMPTS) {
                        getCutDocketStatusForSubPoNumber();
                    } else {
                        throw new Error('Get CutDocket Status For Sub Po Number - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }

        getCutDocketStatusForSubPoNumber();
    });

    step("Check Sub Po Ready For Cut Generation", () => {
        let count = 0;
        cy.wait(500);
        const checkSubPoReadyForCutGeneration = () => {
            cy.task('log', 'frst');
            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: '/production-planning-service/cut-docket-generation/checkSubPoReadyForCutGeneration',
                body: {
                    "poNumber": `${Cypress.env('subPoNumber')}`,
                    "plantCode": `${Cypress.env('plantCode')}`
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                cy.task('log', response.body);
                cy.wait(1000);
                if ((response.body.internalMessage !== Constants.PPS_CHECK_SUB_PO_READY_FOR_CUT_GENERATION_MSG)) {
                    count++;
                    if (count < Constants.MAX_ATTEMPTS) {
                        checkSubPoReadyForCutGeneration();
                    } else {
                        throw new Error('Check Sub Po Ready For Cut Generation - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }

        checkSubPoReadyForCutGeneration();

    });

});
