import {Constants} from "../../../../../common/constants";

const authorization = `Bearer ${Cypress.env("token")}`;
const masterPoNumber = "4495a58b-e8e1-4fdb-905e-fb0c4c0341f8";
const ppsService = Cypress.env("pps");
const mdmService = Cypress.env('mdm');
const userName = Cypress.env('userName');

xdescribe('Add Additional Quantity', function () {

    let activeSampleTypes = [];
    let poQuantities = [];
    let style, selectedSample;

    const processWastagePercentage = 3;
    const extraShipPercentage = 5;

    let updatedOrderQtyTypeDetails = [];


    it('Get All Active Samples', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${mdmService}/sample-type/getAllActiveSampleTypes`
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.data).length.greaterThan(0);
            expect(response.body.internalMessage).to.equal(Constants.MDM_SAMPLE_TYPES_RETRIEVED_SUCCESSFULLY);

            activeSampleTypes = response.body.data;
        })
    })

    it('Get MOS Features and Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
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

    it('Get Order Quantity Update', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/OrderQuantityUpdateController/getOrderQuantityUpdate`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_UPDATE_DETAILS_RECEIVED_SUCCESSFULLY);
            expect(response.body.data).to.haveOwnProperty('poQuantities').and.to.be.an('array');
            expect(response.body.data).to.haveOwnProperty('style').and.to.be.an('string');

            poQuantities = response.body.data.poQuantities;
            style = response.body.data.style;
        })
    })

    // There are 3 scenarios which can be happen on this
    // 1. Extra Shipment Percentage
    // 2. Process Wastage Percentage
    // 3. Sample

    /*
    poQuantityObject = {
         color: "SFBlack"
         lastMoNumber: "1008549798"
         masterPoDetailsId: "c87fa8f0-ceef-450a-bd59-ad89ba9930f5"
         orderQty: 1560
         schedule: "767173"
         size: "XXS"
   }
       quantityObject: {
            quantity: 111,
            originalOrdetqty: 2235,
            color: "SFBlack",
            moNumber: "1008549618",
            rowExcesspercentage: "5.00",
            schedule: "767173",
            size: "M"
       }

     */



    it('Create Order Quantity Update : Extra Shipment + Process Wastage + Sample', () => {

        const option = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/OrderQuantityUpdateController/createOrderQuantityUpdate`,
            body: {
                masterPoNumber: masterPoNumber,
                style: style,
                poNumber: "",
                cuttingPercentage: processWastagePercentage,
                createdUser: userName,
                updatedUser: userName,
                poQuantities: poQuantities,
                orderQtyTypeDetails: []
            }
        }

        // ## Generating Extra Shipment Quantities ## //

        let extraShipmentObject = {
            orderQtyType: 'EXTRA_SHIPMENT',
            orderQtyTypeName: 'EXTRA_SHIPMENT',
            percentage: extraShipPercentage,
            quantities: []
        }

        extraShipmentObject.quantities = poQuantities.map((item)=> {
            return {
                quantity: Math.floor((extraShipPercentage/100)*item.orderQty),
                originalOrdetqty: item.orderQty,
                rowExcesspercentage: extraShipPercentage,
                color: item.color,
                moNumber: item.lastMoNumber,
                schedule: item.schedule,
                size: item.size

            }
        })

        // Adding Extra Shipment to the orderQtyTypeDetails

        option.body.orderQtyTypeDetails.push(extraShipmentObject);


        // ## Generating Sample Quantities ## //

        selectedSample = activeSampleTypes[0]; // Getting the first sample from the active sample
        let sampleQty = 100;

        let extraSampleObject = {
            orderQtyType: 'SAMPLE',
            orderQtyTypeName: selectedSample.sampleTypeCode,
            percentage: extraShipPercentage,
            quantities: []
        }

        extraSampleObject.quantities = poQuantities.map((item) => {
            return {
                quantity: sampleQty,
                rowExcesspercentage: 0,
                color: item.color,
                moNumber: item.lastMoNumber,
                schedule: item.schedule,
                size: item.size,
            }
        });

        // Adding sample to the  orderQtyTypeDetails

        option.body.orderQtyTypeDetails.push(extraSampleObject);

        cy.request(option).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_CREATED_UPDATED_SUCCESSFULLY);
        })


    })

    it('Verifying Order Quantities', () => {
        const options = {
            method: 'POST',
            headers: {authorization: authorization},
            url: `${ppsService}/OrderQuantityUpdateController/getOrderQuantityUpdate`,
            body: {
                masterPoNumber: masterPoNumber
            }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_UPDATE_DETAILS_RECEIVED_SUCCESSFULLY);
            expect(response.body.data).to.haveOwnProperty('poQuantities')
                .and.to.be.an('array');
            expect(response.body.data).to.haveOwnProperty('style')
                .and.to.be.an('string');

            expect(response.body.data).to.haveOwnProperty('cuttingPercentage');
            expect(parseInt(response.body.data.cuttingPercentage, 10)).to.equal(processWastagePercentage);

            expect(response.body.data).to.haveOwnProperty('extrashipmentPercentage');
            expect(parseInt(response.body.data.extrashipmentPercentage, 10)).to.equal(extraShipPercentage);

            expect(response.body.data).to.haveOwnProperty('orderQtyTypeDetails')
                .and.to.be.an('array')
                .and.have.length(3);

            updatedOrderQtyTypeDetails = response.body.data.orderQtyTypeDetails;

        })
    })


    it.skip('Deleting Sample Quantities', () => {

        const filteredTypeDetailForSample = updatedOrderQtyTypeDetails.filter((item) => item.orderQtyTypeName === selectedSample.sampleTypeCode);

        if(filteredTypeDetailForSample.length > 0) {
            let filteredSample = filteredTypeDetailForSample[0];

            const options = {
                method: 'POST',
                headers: {authorization: authorization},
                url: `${ppsService}/OrderQuantityUpdateController/deleteOrderSampleType`,
                body: {
                    orderQuantityUpdateId: filteredSample.orderQuantityUpdateId,
                    versionFlag: 1
                }
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_SAMPLE_TYPES_DEACTIVATION_SUCCESSFUL);
            })

        }


    })

});