import {Constants} from "../../../../../common/constants";

const authorization = `Bearer ${Cypress.env("token")}`;
const masterPoNumber = "4495a58b-e8e1-4fdb-905e-fb0c4c0341f8";
const ppsService = Cypress.env("pps");
const smsService = Cypress.env('sms');
const userName = Cypress.env('userName');
const plantCode = Cypress.env("plantCode");


xdescribe('2) Operation Routing', () => {

    let poStyles = [];
    let poColors = [];
    let operationRoutingVersions = [];
    let masterPoDetails;

    it('Get Default Styles', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getDefaultStylesOfMasterPo`,
            headers: {authorization: authorization},
            body: {masterPoNumber: masterPoNumber},
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_STYLES_SUCCESS);
            expect(response.body.data).to.be.an('array').and.length.greaterThan(0);

            poStyles = response.body.data;
        })
    })

    it('Get MOs Features and Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {authorization: authorization},
            body: {masterPoNumber: masterPoNumber},
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
        })
    })

    it('Get Colors of Master PO and Style', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getColorsOfMasterPoAndStyle`,
            headers: {authorization: authorization},
            body: {masterPoNumber: masterPoNumber, style: poStyles[0].style},
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_COLORS_RETRIEVED_FOR_STYLE_AND_COLOR);
            expect(response.body.data).to.be.an('array').and.length.greaterThan(0);

            poColors = response.body.data;
        })
    })

    it('Get Versions for Style Color from SMS', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getVersionsForStyleColorFromSms`,
            headers: {authorization: authorization},
            body: {style: poStyles[0].style, color: poColors[0].color, plantCode: plantCode},
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_RETRIEVED_SUCCESSFULLY);
            expect(response.body.data).to.be.an('array').length.greaterThan(0);

            operationRoutingVersions = response.body.data;
        })
    })


    it('Get Get Record by ID', () => {

        let selectedVersion = operationRoutingVersions[operationRoutingVersions.length - 1];

        const options = {
            method: 'POST',
            url: `${smsService}/job-group-sequencing/getRecordById`,
            headers: {authorization: authorization},
            body: {_id: selectedVersion._id},
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_RETRIEVED_SUCCESSFULLY);
        })
    })


    it('Get Saved Operation Version of Style Color', () => {

            const options = {
                method: 'POST',
                url: `${ppsService}/MasterProductionOrderController/getSavedOperationVersionOfStyleColor`,
                headers: {authorization: authorization},
                body: {style: poStyles[0].style, color: poColors[0].color, masterPoNumber: masterPoNumber},
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_OPERATION_VERSION_RETRIEVED_SUCCESSFULLY);
            })
        })
        it('Get Master PO Details', () => {

            const options = {
                method: 'POST',
                url: `${ppsService}/MasterProductionOrderController/getMasterPoDetails`,
                headers: {authorization: authorization},
                body: {style: poStyles[0].style, color: poColors[0].color, masterPoNumber: masterPoNumber},
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_RETRIEVED_SUCCESSFULLY_1);

                masterPoDetails = response.body.data;

                cy.wait(500);

            })
        })

        it('Update Operations Version Id', () => {

            let selectedVersion = operationRoutingVersions[operationRoutingVersions.length - 1];

            const options = {
                method: 'POST',
                url: `${ppsService}/MasterProductionOrderController/updateOperationsVersionId`,
                headers: {authorization: authorization},
                body: {
                    masterPoDetailsId: masterPoDetails.masterPoDetailsId,
                    operationsVersionId: selectedVersion.variant,
                    updatedUser: userName,
                    versionFlag: masterPoDetails.versionFlag
                },
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_OPERATION_VERSION_ID_UPDATE_SUCCESSFUL);

            })
        })


})