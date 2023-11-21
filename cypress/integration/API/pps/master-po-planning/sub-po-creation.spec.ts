import { Constants } from "../../../../../common/constants";



xdescribe("Master PO Planning - Sub PO Creation", () => {
    let masterPoQuantitiesSummary;
    let moFeaturesSizeQuantitiesDetailsForMasterPo;
    let masterPoHeaderDetails;
    let subPoNumber = null;
    const masterPoNumber = "796dbc97-96ce-4a3f-88f8-25f88443bfff";
    const authorization = `Bearer ${Cypress.env("token")}`;

    it("get master PO quantity summery", () => {
        const getMasterPoQuantitiesSummary = {
            method: "POST",
            url: `/production-planning-service/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getMasterPoQuantitiesSummary).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14238);
            expect(response.body.internalMessage).to.equal("Master po summary retrieved successfully");
            masterPoQuantitiesSummary = response.body.data;
        })
    })

    it("get sub PO numbers for master PO number", () => {
        const getSubPoNumbersForMasterPONumber = {
            method: "POST",
            url: `/production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getSubPoNumbersForMasterPONumber).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.false;
            expect(response.body.errorCode).to.equal(14801);
            expect(response.body.internalMessage).to.equal("No production orders found");
        })
    })

    it("get MO features size quantities details for Master PO", () => {
        const getMoFeaturesSizeQuantitiesDetailsForMasterPo = {
            method: "POST",
            url: `/production-planning-service/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getMoFeaturesSizeQuantitiesDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14853);
            expect(response.body.internalMessage).to.equal("Features details data found");
            moFeaturesSizeQuantitiesDetailsForMasterPo = response.body.data[0];
        })
    })

    it("get MOs features and master PO header details for master PO", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14114);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
            masterPoHeaderDetails = response.body.data;
        })
    })

    it("create production order", () => {
        const createProductionOrder = {
            method: "POST",
            url: `/production-planning-service/production-order/createProductionOrder`,
            headers: {
                authorization: authorization,
            },
            body: {
                createdUser: "dev",
                cuttingWastagePercentage: 0,
                masterPoNumber,
                moNumbers: moFeaturesSizeQuantitiesDetailsForMasterPo.moNumber,
                poDescription: "test",
            },
        }

        cy.request(createProductionOrder).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14820);
            expect(response.body.internalMessage).to.equal("Sub PO Created Successfully!");
        })
    })

    it("get master PO quantity summery", () => {
        const getMasterPoQuantitiesSummary = {
            method: "POST",
            url: `/production-planning-service/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getMasterPoQuantitiesSummary).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14238);
            expect(response.body.internalMessage).to.equal("Master po summary retrieved successfully");
        })
    })

    it("get MO features size quantities details for Master PO", () => {
        const getMoFeaturesSizeQuantitiesDetailsForMasterPo = {
            method: "POST",
            url: `/production-planning-service/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getMoFeaturesSizeQuantitiesDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14853);
            expect(response.body.internalMessage).to.equal("Features details data found");
            subPoNumber = response.body.data[0].subPoNumber;
        })
    })

    it("get sub PO numbers for master PO number", () => {
        const getSubPoNumbersForMasterPONumber = {
            method: "POST",
            url: `/production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getSubPoNumbersForMasterPONumber).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14846);
            expect(response.body.internalMessage).to.equal("Po numbers dropdown info retrieved successfully");
        })
    })

    it("get PO quantity summery", () => {
        const getPoQuantitySummery = {
            method: "POST",
            url: `/production-planning-service/production-order/getPoQuantitiesSummary`,
            headers: {
                authorization: authorization,
            },
            body: {
                poNumbers: [subPoNumber]
            },
        }

        cy.request(getPoQuantitySummery).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14847);
            expect(response.body.internalMessage).to.equal("Po summary retrieved successfully");
        })
    })

    it("delete production order", () => {
        const getPoQuantitySummery = {
            method: "POST",
            url: `/production-planning-service/production-order/deleteProductionOrder`,
            headers: {
                authorization: authorization,
            },
            body: {
                poNumber: subPoNumber
            },
        }

        cy.request(getPoQuantitySummery).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14218);
            expect(response.body.internalMessage).to.equal("Po Deleted Successfully");
        })
    })

})