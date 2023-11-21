import {Constants} from "../../../../../common/constants";

const authorization = `Bearer ${Cypress.env("token")}`;
const masterPoNumber = "4495a58b-e8e1-4fdb-905e-fb0c4c0341f8";
const ppsService = Cypress.env("pps");
const mdmService = Cypress.env('mdm');
const userName = Cypress.env('userName');



xdescribe('Fabric Properties',() => {

    let masterPoDetails, fabricMaxPliesDetails, updatedMaxPliesDetails;
    let fabricCategories, fabricTypes = [];
    let maxPlies = 50;

    it('Get Master Po by Master PO Number', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/MasterProductionOrderController/getMasterPoByMasterPoNumber`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.haveOwnProperty('masterPoDetails');
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PRODUCTION_ORDER_RECEIVED_SUCCESSFULLY);

            masterPoDetails = response.body.data;


        })
    })

    it('Get MOS Features and Master PO Header Details For Master PO', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo
`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);

        })
    })

    it('Get Fabric Max Piles Details', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/fabric-max-plies/getFabricMaxPliesDetails`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array').and.length.greaterThan(0);
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_FOUND);

            fabricMaxPliesDetails = response.body.data;

        })
    })


    it('Save Excess Cut', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/MasterProductionOrderController/saveExcessCutSelection`,
            body: {
                excessCut: 'FIRST_CUT', // Count Be LAST_CUT also,
                masterPoNumber: masterPoNumber,
                updatedUser: userName,
                versionFlag: masterPoDetails.versionFlag

            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_EXCESS_CUT_SAVED_SUCCESSFULLY);
        })
    })

    it('Update Fabric Max Plies for Master PO', () => {

        let versionFlag = fabricMaxPliesDetails.length > 0 ? fabricMaxPliesDetails[0].versionFlag : 1;
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/fabric-max-plies/updateFabricMaxPliesForMasterPo`,
            body: {
                updatedUser: userName,
                maxPlies: maxPlies,
                versionFlag: versionFlag,
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_UPDATED_SUCCESSFULLY);
        })

    })

    // Edit each RM SKU for assign Fabric Type, Category, Purchase Width and GSM

    it('Get All Fabric Categories Dropdown Data', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${mdmService}/fabric-category/getAllFabricCategoriesDropDownData`
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.MDM_FABRIC_CATEGORY_DATA_RETRIEVED_SUCCESSFULLY);
            expect(response.body.data).to.be.an('array').and.length.greaterThan(0);

            fabricCategories = response.body.data;

        })
    })

    it('Get All Fabric Types Dropdown Data', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${mdmService}/fabric-type/getAllFabricTypesDropDownData`
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.MDM_FABRIC_TYPE_DATA_RETRIEVED_SUCCESSFULLY);
            expect(response.body.data).to.be.an('array').length.greaterThan(0);

            fabricTypes = response.body.data;
        })
    })


    it('Get Updated Fabric Max Piles Details', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/fabric-max-plies/getFabricMaxPliesDetails`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array').and.length.greaterThan(0);
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_FOUND);

            updatedMaxPliesDetails = response.body.data;

        })
    })




    it('Update Fabric Types, Category', () => {

        // Need to get updated fabric max plies details

        updatedMaxPliesDetails.map((item, itemIndex) => {

            let fabricCategory = fabricCategories[itemIndex];
            let fabricType = fabricTypes[itemIndex];

            const options = {
                method: 'POST',
                headers: {authorization: authorization},
                url: `${ppsService}/fabric-max-plies/updateFabricMaxPlies`,
                body: {
                    materialItemCode: item.materialItemCode,
                    masterPoDetailsId: item.masterPoDetailsId,
                    purchaseWidth: 1,
                    fabricCategory: fabricCategory.fabricCategoryCode,
                    consumption: item.consumption,
                    fabricType: fabricType.fabricType,
                    gsm: 1,
                    versionFlag: item.versionFlag,
                    updatedUser: userName
                }
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_UPDATED_SUCCESSFULLY);
            })

            cy.wait(500);
        })

    })

})