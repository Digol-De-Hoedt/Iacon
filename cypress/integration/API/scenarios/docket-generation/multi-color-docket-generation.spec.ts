import {Constants} from "../../../../../common/constants";
import {assertSchema} from "@cypress/schema-tools";
import {schemas} from "../../../../../schema";
import * as Util from "../../../../../common/utils";

/**
 * This file consists of the test automation for sub po creation to docket generation for a multi color (2 colors)
 */

const authorization = `Bearer ${Cypress.env("token")}`;
const ppsService = Cypress.env("pps");
const mdmService = Cypress.env('mdm');
const smsService = Cypress.env("sms");
const omsService = Cypress.env('oms');
const plantCode = Cypress.env("plantCode");
const userName = Cypress.env("userName");
const schedule = Cypress.env('multiColorSchedule');
const style = Cypress.env('multiColorStyle');

let selectedPoData = {
    selectedMasterPo: <any>{},
    selectedStyle: <string | null>null,
    selectedSchedule: <string | null>null,
    selectedColor: <Array<any> | null>null,
    selectedPoVersion: <string | null>null,
    savedDefaultOperationVersion: <Array<any> | null>null
};

let masterPoNumber;
let subPoNumbers = [];
let masterPoDetailsIds = [];
let masterPoDetailsId;
let replacementGroupId = null;



describe("1) Master PO Selection", () => {
    it("Get PO Related Styles", () => {
        const getPoRelatedStyles = {
            method: "POST",
            url: `${omsService}/order-management-service/getPoRelatedStyles`,
            headers: {
                authorization: authorization,
            },
            body: {
                plantCode: plantCode,
            },
        };

        cy.request(getPoRelatedStyles).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Style retrieved successfully");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0, "Styles list retrieved");

            selectedPoData.selectedStyle = style;
        });
    });

    it("Get PO Related Schedules for Selected Style", () => {
        expect(selectedPoData.selectedStyle).to.be.a("string", "Selected style is available");
        const getSchedulesForStyle = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getSchedulesForStyle`,
            headers: {
                authorization: authorization,
            },
            body: {
                plantCode: plantCode,
                style: selectedPoData.selectedStyle,
            },
        };

        cy.request(getSchedulesForStyle).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Schedules Found");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0, "Schedule list retrieved");

            selectedPoData.selectedSchedule = schedule;//response.body.data[0].schedule;
        });
    });

    it("Get PO Related Colors for Selected Style and Schedule", () => {
        expect(selectedPoData.selectedSchedule).to.be.a("string", "Selected schedule is available");
        const getColorsForStyle = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getColorsForStyleSchedules`,
            headers: {
                authorization: authorization,
            },
            body: {
                plantCode: plantCode,
                style: selectedPoData.selectedStyle,
                schedule: [selectedPoData.selectedSchedule],
            },
        };

        cy.request(getColorsForStyle).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Colors Found");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0, "Color list retrieved");

            // Should includes two colors
            selectedPoData.selectedColor = response.body.data.map((item) => item.color)
        });
    });

    it("Get All Master Production Orders for Style-Schedule-Color", () => {
        const getAllMasterProductionOrdersForStyleScheduleColor = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getAllMasterProductionOrdersForStyleScheduleColor`,
            headers: {
                authorization: authorization,
            },
            body: {
                style: selectedPoData.selectedStyle,
                color: selectedPoData.selectedColor,
                schedule: [selectedPoData.selectedSchedule],
                plantCode: plantCode,
            },
        };

        cy.request(getAllMasterProductionOrdersForStyleScheduleColor).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Master Po Details Found");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0, 'Master Production Order list received');
            selectedPoData.selectedMasterPo = response.body.data[0];
            // Logic for select a po with two colors

            masterPoNumber = selectedPoData.selectedMasterPo['masterPoNumber']
        });
    });
});

describe('2) Operation Routing', () => {


    let poStyles = [];
    let poColors = [];
    let operationRoutingVersions = [];
    let masterPoDetails;

    it('Get Default Styles', () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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

        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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

        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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

describe('3) Job Preference',  () =>{

    it("Save Features Of Operation Type", () => {
        const saveFeaturesOfOperationType = {
            method: "POST",
            url: `/${ppsService}/job-preference/saveFeaturesOfOperationType`,
            headers: {
                authorization: authorization,
            },
            body: {
                createdUser: userName,
                logicalBundleQty: 10,
                masterPoNumber,
                packingListFeatures: ["PO"],
                preferredTrackingEntity: "Plan Bundles",
                ratioCreationMethod: "CG",
                sewingJobFeature: "SUB_PO",
                sewingJobGenMethod: "CUTTING"
            },
        }

        cy.request(saveFeaturesOfOperationType).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(15100);
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_TYPES_FEATURES_SAVED_SUCCESSFULLY);
        })
    });

});

describe('4) Add Additional Quantity',  () => {

    let activeSampleTypes = [];
    let poQuantities = [];
    let selectedSample;

    const processWastagePercentage = 5;
    const extraShipPercentage = 8;

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
        })
    })


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

describe('5) Fabric Properties',() => {

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

            let fabricCategory = fabricCategories[itemIndex % updatedMaxPliesDetails.length];
            let fabricType = fabricTypes[itemIndex % fabricTypes.length];

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

describe("6) Component group creation", () => {
    const colors=[];
    let rmComponentsData = null;

    it("get Color of Master PO and Style", () => {
        const getColorsOfMasterPoAndStyle = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getColorsOfMasterPoAndStyle`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, style
            },
        }

        cy.request(getColorsOfMasterPoAndStyle).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14104);
            expect(response.body.internalMessage).to.equal(Constants.PPS_COLORS_RETRIEVED_FOR_STYLE_AND_COLOR);
            response.body.data.map(item => {
                colors.push(item.color);
            });
        })
    });

    it("get features of PO number", () => {
        const getFeaturesOfPoNumber = {
            method: "POST",
            url: `/${ppsService}/job-preference/getFeaturesOfPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getFeaturesOfPoNumber).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(15102);
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_TYPES_FEATURE_SUCCESS);
        })
    });

    it("get MOs features and master PO header details for master PO", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
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
        })
    });

    Cypress._.range(0,2).forEach(k => {
        let fabricDetails = [];
        let components = [];
        it("get components for style color MP version", () => {
            const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
                method: "POST",
                url: `/${ppsService}/MasterProductionOrderController/getComponentsForStyleColorMpVersion`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    masterPoNumber, style, color: colors[k]
                },
            };

            cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(14287);
                expect(response.body.internalMessage).to.equal(Constants.PPS_COMPONENTS_FOR_STYLE_COLOR_OP_VERSION_RETRIEVED_SUCCESSFULLY);
                components = response.body.data.components;
                // cy.task(components)
            });
        });

        it("get master PO details id by style color and master PO number", () => {
            const getMasterPoDetailsIdByStyleColorMasterPoNumber = {
                method: "POST",
                url: `/${ppsService}/MasterProductionOrderController/getMasterPoDetailsIdByStyleColorMasterPoNumber`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    masterPoNumber, style, color: colors[k]
                },
            };

            cy.request(getMasterPoDetailsIdByStyleColorMasterPoNumber).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(14239);
                expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_DETAILS_ID_FOUND);
                masterPoDetailsId = response.body.data;
                masterPoDetailsIds.push(response.body.data);
            })
        });

        it("get RM components mapping for style color", () => {
            const getRmComponentsMappingForStyleColor = {
                method: "POST",
                url: `/${smsService}/components-rmsku-mapping/getRmComponentsMappingForStyleColor`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    masterPoNumber, style, color: colors[k], plantCode
                },
            };

            cy.request(getRmComponentsMappingForStyleColor).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(12202);
                expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_GROUPS_ASSIGNMENTS_DATA_RETRIEVED_SUCCESSFULLY);
                rmComponentsData = response.body.data;
            });
        });

        it("get fabric details by master PO details id", () => {
            const getRmComponentsMappingForStyleColor = {
                method: "POST",
                url: `/${ppsService}/fabric-max-plies/getFabricDetailsByMasterPoDetailId`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    masterPoDetailsId
                },
            };

            cy.request(getRmComponentsMappingForStyleColor).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(14304);
                expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_FOUND);
                fabricDetails = response.body.data;
            });
        });

        it("create component group", () => {
            const createOrUpdateComponentGroup = {
                method: "POST",
                url: `/${ppsService}/component-group/createOrUpdateComponentGroup`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    createdUser: userName,
                    groupType: "COMPONENT",
                    masterPoDetailsId: masterPoDetailsId,
                    masterPoNumber: masterPoNumber,
                    plantCode: plantCode,
                    componentGroupDetails: [
                        {
                            clubMultipler: 0,
                            componentGroupId: "",
                            componentGroupName: "CG1",
                            fabricCategory: fabricDetails[0].fabricCategory,
                            gmtWay: "",
                            isBinding: false,
                            isMainComponentGroup: true,
                            masterPoDetailsId: masterPoDetailsId,
                            materialItemCode: fabricDetails[0].materialItemCode,
                            multiplicationFactor: 1,
                            wastage: 1,
                            fabricComponents: [
                                {
                                    componentName: components[0]
                                }
                            ]
                        },
                        {
                            clubMultipler: 0,
                            componentGroupId: "",
                            componentGroupName: "CG2",
                            fabricCategory: fabricDetails[1].fabricCategory,
                            gmtWay: "",
                            isBinding: false,
                            isMainComponentGroup: false,
                            masterPoDetailsId: masterPoDetailsId,
                            materialItemCode: fabricDetails[1].materialItemCode,
                            multiplicationFactor: 1,
                            wastage: 1,
                            fabricComponents: [
                                {
                                    componentName: components[1]
                                }
                            ]
                        }
                    ]
                },
            };

            cy.request(createOrUpdateComponentGroup).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(14267);
                expect(response.body.internalMessage).to.equal(Constants.PPS_COMPONENT_GROUPS_ASSIGNED_SUCCESSFULLY);
            });
        });
    });
});

describe("7) Replacement group", () => {
    let masterPoColors = [];

    before(() => {
        const getReplacementGroupsByMasterPo = {
            method: "POST",
            url: `/${ppsService}/component-group/getReplacementGroupsByMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, plantCode, groupType: "REPLACEMENT"
            },
        }

        cy.request(getReplacementGroupsByMasterPo).then(async (getReplacementGroupsResponse) => {
            expect(getReplacementGroupsResponse.status).to.equal(201);
            if(getReplacementGroupsResponse.body.data && getReplacementGroupsResponse.body.data.replacementGroupDetails && getReplacementGroupsResponse.body.data.replacementGroupDetails.length > 0) {
                await Promise.all(getReplacementGroupsResponse.body.data.replacementGroupDetails.map((replacementGroup) => {
                    const deleteReplacementGroup = {
                        method: "POST",
                        url: `/${ppsService}/component-group/deleteReplacementGroup`,
                        headers: {
                            authorization: authorization,
                        },
                        body: {
                            groupType: "REPLACEMENT",
                            replacementGroupId: replacementGroup.replacementGroupId,
                            updatedUser: userName,
                            versionFlag: 1,
                        },
                    }

                    cy.request(deleteReplacementGroup).then((response) => {
                        expect(response.status).to.equal(201);
                    })

                }))
            }
        });
    });

    it("Get Default Styles Of Master Po", () => {
        const getDefaultStylesOfMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getDefaultStylesOfMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getDefaultStylesOfMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14250);
            expect(response.body.internalMessage).to.equal(Constants.PPS_STYLES_SUCCESS);
        });
    });

    it("Get Mos Features And Master Po Header Details For Master Po", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
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
        });
    });

    it("Get Colors Of Master Po", () => {
        const getColorsOfMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getColorsOfMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getColorsOfMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14104);
            expect(response.body.internalMessage).to.equal(Constants.PPS_COLORS_RETRIEVED_FOR_STYLE_AND_COLOR);
            response.body.data.forEach(item => masterPoColors.push(item.color));
        });
    });

    it("Get Rm Components Mapping For Styles Colors", () => {
        const getRmComponentsMappingForStylesColors = {
            method: "POST",
            url: `/${smsService}/components-rmsku-mapping/getRmComponentsMappingForStylesColors`,
            headers: {
                authorization: authorization,
            },
            body: {
                plantCode, styles: [style], colors: masterPoColors
            },
        }

        cy.request(getRmComponentsMappingForStylesColors).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(12213);
            expect(response.body.internalMessage).to.equal(Constants.SMS_RMSKUS_AND_COMPONENTS_ASSIGNMENTS_DATA_RETRIEVED_SUCCESSFULLY);
        });
    });

    it("Get Fabric Max Plies Details", () => {
        const getFabricMaxPliesDetails = {
            method: "POST",
            url: `/${ppsService}/fabric-max-plies/getFabricMaxPliesDetails`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber
            },
        }

        cy.request(getFabricMaxPliesDetails).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14304);
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_FOUND);
        });
    });

    it("Get Replacement Groups By Master Po", () => {
        const getFabricMaxPliesDetails = {
            method: "POST",
            url: `/${ppsService}/component-group/getReplacementGroupsByMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, plantCode, groupType: "REPLACEMENT"
            },
        }

        cy.request(getFabricMaxPliesDetails).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.false;
            expect(response.body.errorCode).to.equal(99998);
            expect(response.body.internalMessage).to.equal(Constants.SMS_NO_RECORDS_FOUND);
        });
    });

    it("Get Master Po Details Id By Style Color Master Po Number", () => {
        const getMasterPoDetailsIdByStyleColorMasterPoNumber = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoDetailsIdByStyleColorMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, style, color: masterPoColors[0]
            },
        }

        cy.request(getMasterPoDetailsIdByStyleColorMasterPoNumber).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14239);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_DETAILS_ID_FOUND);
            // masterPoDetailsId = response.body.data;
        });
    });

    it("Create Replacement Group", () => {
        const createReplacementGroup = {
            method: "POST",
            url: `/${ppsService}/component-group/createReplacementGroup`,
            headers: {
                authorization: authorization,
            },
            body: {
                components: ["COMPONENT - 1"],
                createdUser: "dev",
                fabricCategory: "TESTFRT",
                groupType: "REPLACEMENT",
                masterPoDetailsId,
                materialItemCode: "SFSTBEL4FB1 001",
                plantCode: "ENV",
                replacementGroupName: "1",
            },
        }

        cy.request(createReplacementGroup).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14558);
            expect(response.body.internalMessage).to.equal(Constants.PPS_REPLACEMENT_GROUP_CREATED_SUCCESSFULLY);
            replacementGroupId = response.body.data.replacementGroupDetails[0].replacementGroupId;
        });
    });

    it("Get Replacement Groups By Master Po", () => {
        const getFabricMaxPliesDetails = {
            method: "POST",
            url: `/${ppsService}/component-group/getReplacementGroupsByMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, plantCode, groupType: "REPLACEMENT"
            },
        }

        cy.request(getFabricMaxPliesDetails).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14559);
            expect(response.body.internalMessage).to.equal(Constants.PPS_REPLACEMENT_GROUPS_RETRIEVED_SUCCESSFULLY);
            expect(response.body.data.replacementGroupDetails[0].replacementGroupId).to.equal(replacementGroupId);
        });
    });

});

describe('8) Sub PO Creation',() => {


    let moFeaturesSizeQty = [];
    let existingSubPoNumbers = [];


    it('Get Sub PO Numbers for Master PO', () => {

        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then(async (response) => {
            expect(response.status).to.equal(201);



            if(response.body.status && response.body.data && response.body.data.length > 0) {
                // Removing existing Dockets
                existingSubPoNumbers = response.body.data;

                existingSubPoNumbers.map((subPoItem) => {

                    const delOption = {
                        method: 'POST',
                        url: `${ppsService}/production-order/deleteProductionOrder`,
                        headers: {authorization},
                        body: {poNumber: subPoItem.poNumber}
                    }
                    cy.request(delOption).then((response) => {
                        expect(response.status).to.equal(201);
                        expect(response.body.status).to.be.true;
                    })

                })
            }

        })
    })

    it('Get Master Po Quantity Summary', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;

        })
    })

    it('Get MO Features Size Quantities Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');

            // In here response would be an array with two colors
            moFeaturesSizeQty = response.body.data;

        })
    })

    it('Get MOs Features and Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
        })
    })

    it('Create Production Order', () => {

        // In here two Sub POs should create for two colors

         moFeaturesSizeQty.map((item, itemIndex) => {
             const optionsColorOne = {
                 method: 'POST',
                 url: `${ppsService}/production-order/createProductionOrder`,
                 headers: {authorization},
                 body: {
                     createdUser: 'dev',
                     cuttingWastagePercentage: 0,
                     masterPoNumber,
                     moNumbers: item.moNumber,
                     poDescription: `Color ${itemIndex}`
                 }
             }

             cy.request(optionsColorOne).then((response) => {
                 expect(response.status).to.equal(201);
                 expect(response.body.status).to.be.true;
             })
        })

    })


    it('Get Master PO Quantity Summary', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
        })
    })

    it('Get Mo Features Size Quantities Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
        })
    })


    it('Get Sub PO Numbers for Master PO Number', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array').and.have.length(2);

            subPoNumbers = response.body.data;
        })

    })

    it('Get PO Quantity Summary', () => {

        const subPoNumArray = subPoNumbers.map(item => item.poNumber);
        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getPoQuantitiesSummary`,
            headers: {authorization},
            body: {poNumbers: subPoNumArray}
        }


        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
        })
    })

})

describe('9) Sub Ratio PO', () => {
    let subPoSchedulesColors = [];
    let fabricMaxPliesOne, fabricMaxPliesTwo;

    let defaultSizesSubPoOne, defaultSizesSubPoTwo, defaultColorSubPoOne, defaultColorSubPoTwo, subPoOneSchedules, subPoTwoSchedules = [];

    let subPoOneSummaryData, subPoOneComponentGroupRatios, subPoOneRatios;
    let subPoTwoSummaryData, subPoTwoComponentGroupRatios, subPoTwoRatios;


    it('Get Features of PO Number', () => {
        const options = {
            method: 'POST',
            url: `/${ppsService}/job-preference/getFeaturesOfPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {masterPoNumber: masterPoNumber}
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_TYPES_FEATURE_SUCCESS);

        })
    })

    it('Get MOS Features and Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `/${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {masterPoNumber: masterPoNumber}
        };

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);

        })
    })

    it('Get Sub PO Numbers Dropdown For Master PO Number', () => {
        const options = {
            method: 'POST',
            url: `/${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {masterPoNumber: masterPoNumber}
        }
        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_NUMBERS_DROPDOWN_INFO_RETRIEVED_SUCCESSFULLY);

            subPoNumbers = response.body.data;
        })
    })

    it('Get Schedules and Colors For Sub PO', () => {

        subPoNumbers.map(subPo => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getSchedulesAndColorsForSubPo`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPo.poNumber}
            }
            cy.request(options).then(response => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_STYLE_SCHEDULE_COLOR_FOR_PO_SUCCESS);
                subPoSchedulesColors.push({
                    poNumber: subPo.poNumber,
                    ...response.body.data
                });
            })
        })

    })



    it('Get PO Summary and Ratio CG Summary for Sub POs', () => {

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];

        const optionsSubPoOne = {
            method: 'POST',
            url: `/${ppsService}/production-order-ratios/getPoSummaryAndRatioCGSummary`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoOne.poNumber}
        }
        cy.request(optionsSubPoOne).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_SUMMARY_RATIO_COMPONENT_GROUP_SUMMARY_SUCCESS);
            subPoOneSummaryData = response.body.data.poSummary[0].summaryData;
            subPoOneComponentGroupRatios = response.body.data.componentGroupInfoForPO.ratios;
            subPoOneRatios = response.body.data.ratioCGSummary.ratios;
        })


        const optionsSubPoTwo = {
            method: 'POST',
            url: `/${ppsService}/production-order-ratios/getPoSummaryAndRatioCGSummary`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoTwo.poNumber}
        }
        cy.request(optionsSubPoTwo).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_SUMMARY_RATIO_COMPONENT_GROUP_SUMMARY_SUCCESS);
            subPoTwoSummaryData = response.body.data.poSummary[0].summaryData;
            subPoTwoComponentGroupRatios = response.body.data.componentGroupInfoForPO.ratios;
            subPoTwoRatios = response.body.data.ratioCGSummary.ratios;
        })

    })



    it('Get Default Styles of Master PO', () => {

        const options = {
            method: 'POST',
            url: `/${ppsService}/MasterProductionOrderController/getDefaultStylesOfMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {masterPoNumber: masterPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_STYLES_SUCCESS);
        })
    })



    it('Get Default Sizes of PO', () => {
        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];

        const optionsOne = {
            method: 'POST',
            url: `/${ppsService}/production-order/getDefaultSizesOfPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoOne.poNumber, plantCode: plantCode}
        }

        cy.request(optionsOne).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DEFAULT_SIZES_SUCCESS);

            defaultSizesSubPoOne = response.body.data;
        })

        const optionsTwo = {
            method: 'POST',
            url: `/${ppsService}/production-order/getDefaultSizesOfPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoTwo.poNumber, plantCode: plantCode}
        }

        cy.request(optionsTwo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DEFAULT_SIZES_SUCCESS);

            defaultSizesSubPoTwo = response.body.data;
        })


    })

    it('Get Colors info for PO', () => {

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];

        const optionsOne = {
            method: 'POST',
            url: `/${ppsService}/production-order/getColorsInfoForPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoOne.poNumber, plantCode: plantCode}
        }

        cy.request(optionsOne).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_COLORS_SUCCESS);

            defaultColorSubPoOne = response.body.data;

        })

        const optionsTwo = {
            method: 'POST',
            url: `/${ppsService}/production-order/getColorsInfoForPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoTwo.poNumber, plantCode: plantCode}
        }

        cy.request(optionsTwo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_COLORS_SUCCESS);

            defaultColorSubPoTwo = response.body.data;

        })
    })


    it('Get Master PO Serial Description', () => {
        const options = {
            method: 'POST',
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoSerialDesc`,
            headers: {
                authorization: authorization,
            },
            body: {masterPoNumbers: [masterPoNumber]}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DETAILS_SUCCESS);
        })
    })

    it('Get Sub PO Serial Numbers', () => {

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];

        const option = {
            method: 'POST',
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoSerialDesc`,
            headers: {
                authorization: authorization,
            },
            body: {poNumbers: [subPoOne.poNumber, subPoTwo.poNumber]}
        }

        cy.request(option).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DETAILS_SUCCESS);
        })


    })


    it('Get Schedules info for PO', () => {

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];


        const optionOne = {
            method: 'POST',
            url: `/${ppsService}/production-order/getSchedulesInfoForPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoOne.poNumber, plantCode: plantCode}
        }

        cy.request(optionOne).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_SCHEDULES_SUCCESS);

            subPoOneSchedules = response.body.data;
        })

        const optionTwo = {
            method: 'POST',
            url: `/${ppsService}/production-order/getSchedulesInfoForPo`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoTwo.poNumber, plantCode: plantCode}
        }

        cy.request(optionTwo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_SCHEDULES_SUCCESS);

            subPoTwoSchedules = response.body.data;
        })
    })

    it('Get Ratio Fabric Category Max Files Default', () => {
        const optionsOne = {
            method: 'POST',
            url: `/${ppsService}/production-order-ratios/getRatioFabricCategoryMaxPliesDefault`,
            headers: {
                authorization: authorization,
            },
            body: {poDetailId: subPoOneSchedules[0].masterPoDetailId}
        }

        cy.request(optionsOne).then((response) => {
            expect(response.status).to.be.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_FABRIC_DEFAULT_MAX_PILES_SUCCESS);
            fabricMaxPliesOne = response.body.data;
        })

        const optionsTwo = {
            method: 'POST',
            url: `/${ppsService}/production-order-ratios/getRatioFabricCategoryMaxPliesDefault`,
            headers: {
                authorization: authorization,
            },
            body: {poDetailId: subPoTwoSchedules[0].masterPoDetailId}
        }

        cy.request(optionsTwo).then((response) => {
            expect(response.status).to.be.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_FABRIC_DEFAULT_MAX_PILES_SUCCESS);
            fabricMaxPliesTwo = response.body.data;
        })
    })

    it('Create Component Group Based Ratio', () => {

        // Creating Ratios for Sub POs

        const totalQtySubPoOne = Util.calculateQty(subPoOneSummaryData);
        const totalQtySubPoTwo = Util.calculateQty(subPoTwoSummaryData);

        const quantitiesSubPoOne = Util.calculateSizeRatios(defaultSizesSubPoOne, totalQtySubPoOne);
        const quantitiesSubPoTwo = Util.calculateSizeRatios(defaultSizesSubPoTwo, totalQtySubPoTwo);
        const colorRatioSubPoOne = defaultColorSubPoOne.map((item) => ({color: item.color, ratio: 1 }))
        const colorRatioSubPoTwo = defaultColorSubPoTwo.map((item) => ({color: item.color, ratio: 1 }))

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];



        subPoOneComponentGroupRatios.map((ratio, ratioIndex) => {

            const options = {
                method: 'POST',
                url: '/production-planning-service/production-order-ratios/createComponentGroupBasedRatio',
                body: {
                    poNumber: subPoOne.poNumber,
                    ratioManualCode: `${ratioIndex}`,
                    ratioType: "NORMAL",
                    cutType: "NORMAL",
                    ratioPlies: quantitiesSubPoOne.leastQty,
                    ratioDescription: `Testing ${ratioIndex}`,
                    createdUser: "dev",
                    plantCode: "ENV",
                    colorRatios: colorRatioSubPoOne,
                    sizeRatios: quantitiesSubPoOne.sizeRatios,
                    fabricCategoryMaxPlies: fabricMaxPliesOne,
                    cgId: [
                        ratio.cgId
                    ],
                    ratioCategory: "CG"
                }
            }


            cy.request(options).then((response) => {
                expect(response.status).to.be.equal(201);
                expect(response.body.status).to.be.true;
            })
        })

        subPoTwoComponentGroupRatios.map((ratio, ratioIndex) => {

            const options = {
                method: 'POST',
                url: '/production-planning-service/production-order-ratios/createComponentGroupBasedRatio',
                body: {
                    poNumber: subPoTwo.poNumber,
                    ratioManualCode: `${ratioIndex}`,
                    ratioType: "NORMAL",
                    cutType: "NORMAL",
                    ratioPlies: quantitiesSubPoTwo.leastQty,
                    ratioDescription: `Testing ${ratioIndex}`,
                    createdUser: "dev",
                    plantCode: "ENV",
                    colorRatios: colorRatioSubPoTwo,
                    sizeRatios: quantitiesSubPoTwo.sizeRatios,
                    fabricCategoryMaxPlies: fabricMaxPliesTwo,
                    cgId: [
                        ratio.cgId
                    ],
                    ratioCategory: "CG"
                }
            }

            cy.request(options).then((response) => {
                expect(response.status).to.be.equal(201);
                expect(response.body.status).to.be.true;
            })
        })

    })



})

describe('10) Sub Po Marker Versions', () => {
    let markerTypeId;
    let ratioWiseComponents = [];

    it("Get Sub-PO Numbers Dropdown for Master PO Number", () => {
        const getSubPoNumbersDropDownForMasterPoNumber = {
            method: "POST",
            url: `${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getSubPoNumbersDropDownForMasterPoNumber)
            .then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_NUMBERS_DROPDOWN_INFO_RETRIEVED_SUCCESSFULLY);
                expect(response.body.status).to.be.true;

                const assertCreateSampleResponse = assertSchema(schemas)("getSubPoNumbersDropDownForMasterPoNumber", "1.0.0");
                expect(() => {
                    assertCreateSampleResponse(response.body);
                }).not.throw();

                return response.body.data;
            })
            .then((data) => {
                expect(data).to.be.an("array").and.have.length.greaterThan(0);
            });
    });

    it("Get MOS Features And Master PO Header Details for Master PO", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getMosFeaturesAndMasterPoHeaderDetailsForMasterPo", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get All Fabric Types from MDM", () => {
        const getAllFabricTypes = {
            method: "POST",
            url: `master-data-management-service/fabric-type/getAllFabricTypes`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getAllFabricTypes).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.MDM_FABRIC_TYPES_DATA_RETRIEVED_SUCCESSFULLY);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getAllFabricTypes", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get All ACtive Marker Types from MDM", () => {
        const getAllActiveMarkerTypes = {
            method: "POST",
            url: `master-data-management-service/marker-type/getAllActiveMarkerTypes`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getAllActiveMarkerTypes)
            .then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.internalMessage).to.equal(Constants.MDM_DATA_FOUND);
                expect(response.body.status).to.be.true;

                const assertCreateSampleResponse = assertSchema(schemas)("getAllActiveMarkerTypes", "1.0.0");
                expect(() => {
                    assertCreateSampleResponse(response.body);
                }).not.throw();
                return response.body.data;
            })
            .then((data) => {
                expect(data).to.be.an("array").and.have.length.greaterThan(0);
                markerTypeId = data[0].markerTypeId;
            });
    });

    it("Get Marker Versions for PO", () => {

        subPoNumbers.map((subPo) => {
            const getMarkerVersionsForPo = {
                method: "POST",
                url: `${ppsService}/marker-versions/getMarkerVersionsForPo`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    poNumber: subPo.poNumber,
                },
            };

            cy.request(getMarkerVersionsForPo)
                .then((response) => {
                    expect(response.status).to.equal(201);
                    //No Records Found
                    //expect(response.body.internalMessage).to.equal("Marker Details for given po retrieved successfully!!!");
                    expect(response.body.status).to.be.true;
                    expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0);

                    const assertCreateSampleResponse = assertSchema(schemas)("getMarkerVersionsForPo", "1.0.0");
                    expect(() => {
                        assertCreateSampleResponse(response.body);
                    }).not.throw();
                    return response.body.data;
                })
                .then((data) => {
                    expect(data).to.be.an("array").and.have.length.greaterThan(0);
                    ratioWiseComponents.push(...data);
                });
        })

    });

   it("Create Marker Version for PO", () => {

        ratioWiseComponents.map((component, componentIndex) => {
            const createMarkerVersion = {
                method: "POST",
                url: `${ppsService}/marker-versions/createMarkerVersion`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    markerVersion: `${componentIndex}`,
                    patternVersion: "1",
                    markerTypeId: markerTypeId,
                    shrinkage: "1",
                    width: 1,
                    length: 1,
                    efficiency: 1,
                    endAllowance: 1,
                    perimeter: 1,
                    remark1: "1",
                    ratioWiseComponentGroupId: component.ratioWiseComponentGroupId,
                    defaultMarkerVersion: true,
                    createdUser: userName,
                },
            };

            cy.request(createMarkerVersion).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.a('boolean');

                if(response.body.status == true) {
                    expect(response.body.internalMessage).to.equal(Constants.PPS_MARKER_VERSION_SAVED_SUCCESSFULLY);
                    const assertCreateSampleResponse = assertSchema(schemas)("createMarkerVersion", "1.0.0");
                    expect(() => {
                        assertCreateSampleResponse(response.body);
                    }).not.throw();
                }
            });

            cy.wait(500);
        })

    });
})

describe("11) Makers Summery", () => {
    it('Get MOS Features And Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {authorization: authorization},
            body: {masterPoNumber: masterPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
        })
    })

    it('Get Marker Summary Data For PO', () => {

        subPoNumbers.map((subPo) => {
            const options = {
                method: 'POST',
                url: '/production-planning-service/marker-versions/getMarkersSummeryDataForPo',
                headers: {authorization: authorization},
                body: {poNumber: subPo.poNumber}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_MARKERS_SUMMARY_DATA_SUCCESS);
            })
        })

    })
});

describe("12) Packing List", () => {

    const operationCategory = "SEWING_JOB_FEATURE";

    let schedule = [];
    let markerTypeId = "";
    let ratioWiseComponentGroupId = "";

    it("Get MOS Features And Master PO Header Details for Master PO", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                operationCategory: operationCategory,
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getMosFeaturesAndMasterPoHeaderDetailsForMasterPo", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get Features of Operation Type - SEWING_JOB_FEATURE", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/job-preference/getFeaturesOfOperationType`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                operationCategory: "SEWING_JOB_FEATURE",
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_TYPES_FEATURE_SUCCESS);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getFeaturesOfOperationType", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    // todo
    // again for PACKING_LIST_FEATURES
    // re-do with proper method
    it("Get Features of Operation Type - PACKING_LIST_FEATURES", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/job-preference/getFeaturesOfOperationType`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                operationCategory: "PACKING_LIST_FEATURES",
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_TYPES_FEATURE_SUCCESS);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getFeaturesOfOperationType", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get MP Pack List Summary", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getMpPackListSummary`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_PACKING_LIST_SUMMARY_RETRIEVD_SUCCESSFULLY);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getMpPackListSummary", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get Feature Values for Selected Feature", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/packing-ratio/getFeatureValuesForSelectedFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                requiredFeature: ["schedule"],
                selectedFeatures: {},
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_FEATURES_RETRIEVED_SUCCESFULLY);
            expect(response.body.status).to.be.true;

            expect(response.body.data.schedule).to.be.an("array");

            const assertCreateSampleResponse = assertSchema(schemas)("getFeatureValuesForSelectedFeatures", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();

            if (response.body.data.schedule.length > 0) schedule = [response.body.data.schedule[0]];
        });
    });

    it("Get MP Pack List Summary for Fearures", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getMpPackListSummaryForFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                schedule: schedule
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_PACKING_LIST_SUMMARY_RETRIEVD_SUCCESSFULLY);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getMpPackListSummary", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    // todo data schema incomplete
    it("Get Pack Method Details for Feature", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getPackMethodDetailsForFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                schedule: schedule
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_PACK_METHOD_DETAILS_RECEIVED_SUCCESSFULLY);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getPackMethodDetailsForFeatures", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });

    it("Get MP Pack List Summary for Fearures", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getMpPackListSummaryForFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                schedule: schedule
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal(Constants.PPS_PACKING_LIST_SUMMARY_RETRIEVD_SUCCESSFULLY);
            expect(response.body.status).to.be.true;

            const assertCreateSampleResponse = assertSchema(schemas)("getMpPackListSummary", "1.0.0");
            expect(() => {
                assertCreateSampleResponse(response.body);
            }).not.throw();
        });
    });
});

describe("13) Generating Dockets", () => {

    it("Generating Dockets for Sub PO", () => {

        const subPoOne = subPoNumbers[0];
        const subPoTwo = subPoNumbers[1];

        cy.wait(10000);

        //Sub Po One
        cy.request({
            method: 'POST',
            headers: {
                authorization: authorization,
            },
            url: `/${ppsService}/cut-docket-generation/generateDocketsForSubPo`,
            body: {
                "subPo": subPoOne.poNumber,
                "userName": userName,
                "plantCode": plantCode
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
            url: `/${ppsService}/production-order-ratios/displayRatioComponentGroupsForSubPO`,
            body: {
                "poNumber": subPoOne.poNumber
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', Constants.PPS_DISPLAY_RATIO_COMPONENT_GROUPS_FOR_SUB_PO);
        });



        // Sub PO Two
        cy.wait(10000);

        cy.request({
            method: 'POST',
            headers: {
                authorization: authorization,
            },
            url: `/${ppsService}/cut-docket-generation/generateDocketsForSubPo`,
            body: {
                "subPo": subPoTwo.poNumber,
                "userName": userName,
                "plantCode": plantCode
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
            url: `/${ppsService}/production-order-ratios/displayRatioComponentGroupsForSubPO`,
            body: {
                "poNumber": subPoTwo.poNumber
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', Constants.PPS_DISPLAY_RATIO_COMPONENT_GROUPS_FOR_SUB_PO);
        });



    });

    it("Get CutDocket Status For Sub Po Number One", () => {
        let countOne = 0;
        let countTwo = 0;
        const getCutDocketStatusForSubPoNumberOne = () => {
            cy.wait(500);
            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/production-order/getCutDocketStatusForSubPoNumber`,
                body: {
                    "poNumber": subPoNumbers[0].poNumber,
                    "plantCode": plantCode
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.equal(true);
                expect(response.body).has.property('internalMessage', Constants.PPS_GET_CUT_DOCKET_STATUS_FOR_SUB_PO_NO_MSG);

                if (response.body.data.docsGenerated !== Constants.PPS_DOCKET_GEN_DONE) {
                    countOne++;
                    if (countOne < Constants.MAX_ATTEMPTS) {
                        getCutDocketStatusForSubPoNumberOne();
                    } else {
                        throw new Error('Get CutDocket Status For Sub Po Number - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }

        const getCutDocketStatusForSubPoNumberTwo = () => {
            cy.wait(500);
            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/production-order/getCutDocketStatusForSubPoNumber`,
                body: {
                    "poNumber": subPoNumbers[1].poNumber,
                    "plantCode": plantCode
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.equal(true);
                expect(response.body).has.property('internalMessage', Constants.PPS_GET_CUT_DOCKET_STATUS_FOR_SUB_PO_NO_MSG);
                //cy.task('log', response.body);
                cy.wait(500);
                if (response.body.data.docsGenerated !== Constants.PPS_DOCKET_GEN_DONE) {
                    countTwo++;
                    if (countTwo < Constants.MAX_ATTEMPTS) {
                        getCutDocketStatusForSubPoNumberTwo();
                    } else {
                        throw new Error('Get CutDocket Status For Sub Po Number - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }

      getCutDocketStatusForSubPoNumberOne();
      cy.wait(1000);
      getCutDocketStatusForSubPoNumberTwo();

    });



    it("Check Sub Po Ready For Cut Generation", () => {
        let countOne = 0;
        let countTwo = 0;
        cy.wait(500);
        const checkSubPoOneReadyForCutGeneration = () => {
            cy.task('log', 'frst');
            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/cut-docket-generation/checkSubPoReadyForCutGeneration`,
                body: {
                    "poNumber": subPoNumbers[0].poNumber,
                    "plantCode": plantCode
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                cy.task('log', response.body);
                cy.wait(1000);
                if ((response.body.internalMessage !== Constants.PPS_CHECK_SUB_PO_READY_FOR_CUT_GENERATION_MSG)) {
                    countOne++;
                    if (countOne < Constants.MAX_ATTEMPTS) {
                        checkSubPoOneReadyForCutGeneration();
                    } else {
                        throw new Error('Check Sub Po Ready For Cut Generation - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }
        const checkSubPoTwoReadyForCutGeneration = () => {
            cy.task('log', 'frst');
            cy.request({
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/cut-docket-generation/checkSubPoReadyForCutGeneration`,
                body: {
                    "poNumber": subPoNumbers[1].poNumber,
                    "plantCode": plantCode
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                cy.task('log', response.body);
                cy.wait(1000);
                if ((response.body.internalMessage !== Constants.PPS_CHECK_SUB_PO_READY_FOR_CUT_GENERATION_MSG)) {
                    countTwo++;
                    if (countTwo < Constants.MAX_ATTEMPTS) {
                        checkSubPoTwoReadyForCutGeneration();
                    } else {
                        throw new Error('Check Sub Po Ready For Cut Generation - FAILED');
                    }
                } else {
                    // put assertions
                }
            });

        }

        checkSubPoOneReadyForCutGeneration();
        cy.wait(1000);
        checkSubPoTwoReadyForCutGeneration();

    });

    after(() => {

        let existingMarkerRatios = [];
        let existingSubPoNumbers = [];

        const options = {
            method: 'POST',
            url: `${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
            headers: {authorization},
            body: {masterPoNumber}
        }

        cy.request(options).then(async (response) => {
            expect(response.status).to.equal(201);

            if(response.body.status && response.body.data && response.body.data.length > 0) {
                existingSubPoNumbers = response.body.data;

                await Promise.all(existingSubPoNumbers.map(async (subPoItem) => {
                    const deleteDockets = {
                        method: 'POST',
                        url: `${ppsService}/cut-docket-generation/deleteDockets`,
                        headers: {authorization},
                        body: {
                            subPo: subPoItem.poNumber,
                            userName: userName,
                            plantCode: plantCode
                        }
                    }

                    cy.request(deleteDockets).then(response => {
                        expect(response.status).to.equal(201);
                    })
                    cy.wait(1000);


                    const optionMarkerVersions = {
                        method: "POST",
                        url: `${ppsService}/marker-versions/getMarkerVersionsForPo`,
                        headers: {authorization},
                        body: {
                            poNumber: subPoItem.poNumber
                        }
                    }

                    cy.request(optionMarkerVersions).then((response) => {
                        expect(response.status).to.equal(201);
                        if(response.body.status && response.body.data && response.body.data.length > 0) {
                            const ratios = response.body.data;

                            ratios.map((item) => {
                                const markerVersion = item.markerVersions;
                                markerVersion.map((version) => {
                                    const markerDeleteOptions = {
                                        method: 'POST',
                                        url: `${ppsService}/marker-versions/deleteMarkerVersion`,
                                        headers: {authorization},
                                        body: {
                                            markerVersionId: version.markerVersionId,
                                            updatedUser: userName,
                                            versionFlag: version.versionFlag
                                        }
                                    }
                                    cy.request(markerDeleteOptions).then(response => {
                                        expect(response.status).to.equal(201);
                                    })
                                })

                            })

                        }
                    })

                }))

                await Promise.all(existingSubPoNumbers.map((subPo) => {
                    const optionsSubPoOne = {
                        method: 'POST',
                        url: `/${ppsService}/production-order-ratios/getPoSummaryAndRatioCGSummary`,
                        headers: {
                            authorization: authorization,
                        },
                        body: {poNumber: subPo.poNumber}
                    }

                    cy.request(optionsSubPoOne).then(response => {
                        expect(response.status).to.equal(201);
                        expect(response.body.status).to.be.true;
                        expect(response.body.internalMessage).to.equal(Constants.PPS_SUMMARY_RATIO_COMPONENT_GROUP_SUMMARY_SUCCESS);
                        existingMarkerRatios = response.body.data.ratioCGSummary.ratios;

                        const ratios = [].concat.apply([], existingMarkerRatios);

                        ratios.map((ratio) => {
                            const ratioDeleteOptions = {
                                method: 'POST',
                                url: `${ppsService}/production-order-ratios/deleteRatio`,
                                headers: {authorization},
                                body: {
                                    ratioId: ratio.ratioId,
                                    updatedUser: 'dev',
                                    versionFlag: 1
                                }
                            }

                            cy.request(ratioDeleteOptions).then((response) => {
                                expect(response.status).to.equal(201);
                                expect(response.body.status).to.be.true;
                                expect(response.body.internalMessage).to.equal(Constants.PPS_SUB_PO_RATIO_DELETE_SUCCESS);
                            })
                        })
                    })

                    cy.wait(500);

                    const optionDelete = {
                        method: 'POST',
                        url: `${ppsService}/production-order/deleteProductionOrder`,
                        headers: {authorization: authorization},
                        body: {poNumber: subPo.poNumber}
                    }

                    cy.request(optionDelete).then((response) => {
                        cy.log(response.body);
                        expect(response.status).to.equal(201);
                        expect(response.body.status).to.true;
                        expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DELETED_SUCCESSFULLY);
                    })

                    cy.wait(1000);

                }));

                // delete replacement groups
                const getReplacementGroupsByMasterPo = {
                    method: "POST",
                    url: `/${ppsService}/component-group/getReplacementGroupsByMasterPo`,
                    headers: {
                        authorization: authorization,
                    },
                    body: {
                        masterPoNumber, plantCode, groupType: "REPLACEMENT"
                    },
                }

                cy.request(getReplacementGroupsByMasterPo).then(async (getReplacementGroupsResponse) => {
                    expect(getReplacementGroupsResponse.status).to.equal(201);
                    if(getReplacementGroupsResponse.body.data && getReplacementGroupsResponse.body.data.replacementGroupDetails && getReplacementGroupsResponse.body.data.replacementGroupDetails.length > 0) {
                        await Promise.all(getReplacementGroupsResponse.body.data.replacementGroupDetails.map((replacementGroup) => {
                            const deleteReplacementGroup = {
                                method: "POST",
                                url: `/${ppsService}/component-group/deleteReplacementGroup`,
                                headers: {
                                    authorization: authorization,
                                },
                                body: {
                                    groupType: "REPLACEMENT",
                                    replacementGroupId: replacementGroup.replacementGroupId,
                                    updatedUser: userName,
                                    versionFlag: 1,
                                },
                            }

                            cy.request(deleteReplacementGroup).then((response) => {
                                expect(response.status).to.equal(201);
                            })

                        }))
                    }
                });

                // delete component groups
                await Promise.all(masterPoDetailsIds.map(masterPoDetailsId => {
                    const deleteComponentGroup = {
                        method: "POST",
                        url: `/${ppsService}/component-group/deleteComponentGroup`,
                        headers: {
                            authorization: authorization,
                        },
                        body: {
                            masterPoDetailsId, groupType: "COMPONENT"
                        },
                    }

                    cy.request(deleteComponentGroup).then((response) => {
                        expect(response.status).to.equal(201);
                    })
                }))
            }
        })

    })


});

