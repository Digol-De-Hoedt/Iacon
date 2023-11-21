/// <reference types = "Cypress"/>
/**
 * This file consists of the test automation for sub po creation to docket generation for a single color
 */

import {schemas} from "../../../../../schema";
import {assertSchema} from "@cypress/schema-tools";
import {Constants} from "../../../../../common/constants";
import * as Util from "../../../../../common/utils";

let masterPoNumber = null;
const authorization = `Bearer ${Cypress.env("token")}`;
const plantCode = Cypress.env("plantCode");
const userName = Cypress.env("userName");
const ppsService = Cypress.env("pps");
const smsService = Cypress.env("sms");
const mdmService = Cypress.env('mdm');
const omsService = Cypress.env("oms");
const style = Cypress.env("singleColorStyle");
const schedule = Cypress.env("singleColorSchedule");
const color = Cypress.env("singleColorColor");
let selectedPoData = {
    selectedMasterPo: <any>{},
    selectedStyle: <string | null>null,
    selectedSchedule: <string | null>null,
    selectedColor: <string | null>null,
    selectedPoVersion: <string | null>null,
    savedDefaultOperationVersion: <Array<any> | null>null
};
let subPoNumber = null;

let activeSampleTypes = [];
let poQuantities = [];
let addAdditionalQtyStyle = "";

let orderQuantitiesData = {
    ORIGINAL_QUANTITY: {},
    EXTRA_SHIPMENT: {},
    SAMPLE: {},
};

let fabricDetails = null;
let masterPoDetailsId = null;
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
        const getSchedulesForStyle = {
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

        cy.request(getSchedulesForStyle).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Colors Found");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array").and.have.length.greaterThan(0, "Schedule list retrieved");

            selectedPoData.selectedColor = color;//response.body.data[0].color;
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
                color: [selectedPoData.selectedColor],
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

            masterPoNumber = selectedPoData.selectedMasterPo['masterPoNumber']
        });
    });
});

describe("2) Operation Routing", () => {
    it("Get Default Styles of Master PO", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

        const getDefaultStylesOfMasterPo = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getDefaultStylesOfMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };
        cy.request(getDefaultStylesOfMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Styles Retrieved Sucessfully");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array");
        });
    });

    it("Get MOs Features and Master PO Header Details for Master PO", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

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
            expect(response.body.data).to.be.an("object");
        });
    });

    it("Get Colors of Master PO and Style", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

        const getColorsOfMasterPoAndStyle = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getColorsOfMasterPoAndStyle`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                style: selectedPoData.selectedMasterPo.style,
            },
        };
        cy.request(getColorsOfMasterPoAndStyle).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Colors retrieved for style and color");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an("array");
        });
    });

    it("Get Saved Operation Version of Style-Color", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

        const getSavedOperationVersionOfStyleColor = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getSavedOperationVersionOfStyleColor`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                color: selectedPoData.selectedMasterPo.color,
                style: selectedPoData.selectedMasterPo.style,
            },
        };
        cy.request(getSavedOperationVersionOfStyleColor).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Operation version retrieved successfully");
            expect(response.body.status).to.be.true;
            cy.log(response.body.data);
            expect(response.body.data).to.be.a("string", "Saved default version for style-color received");

            selectedPoData.savedDefaultOperationVersion = response.body.data;
        });
    });

    it("Get Versions for Style-Color from SMS", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

        const getVersionsForStyleColorFromSms = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getVersionsForStyleColorFromSms`,
            headers: {
                authorization: authorization,
            },
            body: {
                plantCode: plantCode,
                color: selectedPoData.selectedMasterPo.color,
                style: selectedPoData.selectedMasterPo.style,
            },
        };

        cy.request(getVersionsForStyleColorFromSms).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Data Retrieved successfully");
            expect(response.body.status).to.be.true;
            cy.log(response.body.data);
            expect(response.body.data).to.be.an("array");

            const defaultVersionWithFlagTrue = Array.from(response.body.data).filter((i) => i["defaultOperation"] === true);
            expect(defaultVersionWithFlagTrue).to.have.lengthOf(1, "Previously saved version received successfully");

            const versionDataMatchingSavedVersion = Array.from(response.body.data).filter((i) => i["variant"] === selectedPoData.savedDefaultOperationVersion);
            expect(versionDataMatchingSavedVersion).to.have.lengthOf(1, "Previously saved version received successfully");

        });
    });

    it("Get Saved Operation Version of Style-Color", () => {
        expect(selectedPoData.selectedMasterPo).to.be.an("object", "Data selected from Master PO is available");

        const getSavedOperationVersionOfStyleColor = {
            method: "POST",
            url: `${ppsService}/MasterProductionOrderController/getSavedOperationVersionOfStyleColor`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                color: selectedPoData.selectedMasterPo.color,
                style: selectedPoData.selectedMasterPo.style,
            },
        };
        cy.request(getSavedOperationVersionOfStyleColor).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Operation version retrieved successfully");
            expect(response.body.status).to.be.true;
            cy.log(response.body.data);
            expect(response.body.data).to.be.a("string");

            selectedPoData.savedDefaultOperationVersion = response.body.data;
        });
    });
});

describe('3) Job Preference',  () => {

    it("Save Features Of Operation Type", () => {
        const saveFeaturesOfOperationType = {
            method: "POST",
            url: `/${ppsService}/job-preference/saveFeaturesOfOperationType`,
            headers: {
                authorization: authorization,
            },
            body: {
                createdUser: userName,
                logicalBundleQty: 35,
                masterPoNumber,
                packingListFeatures: ["PO", "SCHEDULE"],
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

describe("4) Add Additional Qty", () => {
    it("get order quantity update", () => {
        const getOrderQuantityUpdate = {
            method: "POST",
            url: `/${ppsService}/OrderQuantityUpdateController/getOrderQuantityUpdate`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
            },
        };

        cy.request(getOrderQuantityUpdate).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14831);
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_UPDATE_DETAILS_RECEIVED_SUCCESSFULLY);
            expect(response.body.data).to.be.an("object");

            expect(response.body.data.poQuantities).to.be.an("array");
            expect(response.body.data.style).to.be.a("string");

            poQuantities = response.body.data.poQuantities;
            addAdditionalQtyStyle = response.body.data.style;
        });
    });

    it("get all active sample types", () => {
        const getAllActiveSampleTypes = {
            method: "POST",
            url: `/${mdmService}/sample-type/getAllActiveSampleTypes`,
            headers: {
                authorization: authorization,
            },
            body: {},
        };

        cy.request(getAllActiveSampleTypes)
            .then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.errorCode).to.equal(10108);
                expect(response.body.internalMessage).to.equal(Constants.MDM_SAMPLE_TYPES_RETRIEVED_SUCCESSFULLY);
                expect(response.body.data).to.be.an("array");
                return response.body.data;
            })
            .then((activeSampleTypesArray) => {
                activeSampleTypes = activeSampleTypesArray;
            });
    });

    it("get MOs features and master PO header details for master PO", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber,
            },
        };

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14114);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
        });
    });

    it("create order quantity update", () => {
        expect(poQuantities).to.be.an('array').and.have.length.greaterThan(0, 'PO Quantities received')
        expect(activeSampleTypes).to.be.an('array').and.have.length.greaterThan(0, 'Active sample types received');
        const extraPct = 0.05
        const sampleQty = 34
        const sampleType = activeSampleTypes[0].sampleTypeCode

        const extraQuantities = poQuantities.map(i => (
            {
                quantity: Math.floor(i.orderQty * extraPct),
                originalOrdetqty: i.orderQty,
                color: i.color,
                moNumber: i.lastMoNumber,
                rowExcesspercentage: extraPct * 100,
                schedule: i.schedule,
                size: i.size,
            }
        ))
        //  [
        //     {
        //         quantity: 13,
        //         originalOrdetqty: 1335,
        //         color: "SFBlack",
        //         moNumber: "1008549558",
        //         rowExcesspercentage: 1,
        //         schedule: "767173",
        //         size: "L",
        //     }
        // ];

        const sampleQuantities = poQuantities.map(i => (
            {
                quantity: sampleQty,
                originalOrdetqty: i.orderQty,
                color: i.color,
                moNumber: i.lastMoNumber,
                rowExcesspercentage: "0.0",
                schedule: i.schedule,
                size: i.size,
            }
        ))

        // [
        //     {
        //         quantity: 16,
        //         originalOrdetqty: 1335,
        //         color: "SFBlack",
        //         moNumber: "1008549558",
        //         rowExcesspercentage: "0.00",
        //         schedule: "767173",
        //         size: "L",
        //     }
        // ];

        const createOrderQuantityUpdate = {
            method: "POST",
            url: `/${ppsService}/OrderQuantityUpdateController/createOrderQuantityUpdate`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                style: addAdditionalQtyStyle,
                poNumber: "",
                cuttingPercentage: 1,
                createdUser: userName,
                updatedUser: userName,
                poQuantities: poQuantities, // just pass values
                orderQtyTypeDetails: [
                    {
                        orderQtyType: "EXTRA_SHIPMENT",
                        orderQtyTypeName: "EXTRA_SHIPMENT",
                        percentage: 1,
                        quantities: extraQuantities,
                    },
                    {
                        orderQtyType: "SAMPLE",
                        orderQtyTypeName: sampleType,
                        percentage: 1,
                        quantities: sampleQuantities,
                    },
                ], // need to update via a loop for EXTRA_SHIPMENT, SAMPLE.
            },
        };

        extraQuantities.forEach((poQuantityForSingleSize) => {
            orderQuantitiesData.ORIGINAL_QUANTITY[poQuantityForSingleSize.size] = poQuantityForSingleSize; // save as key: values
            orderQuantitiesData.EXTRA_SHIPMENT[poQuantityForSingleSize.size] = poQuantityForSingleSize; // save as key: values
        });

        sampleQuantities.forEach((poQuantityForSingleSize) => {
            orderQuantitiesData.SAMPLE[poQuantityForSingleSize.size] = poQuantityForSingleSize; // save as key: values
        });

        cy.request(createOrderQuantityUpdate).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14829);
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_CREATED_UPDATED_SUCCESSFULLY);
        });
    });
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

    let color = null;
    let components = null;
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
            color = response.body.data[0].color;
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

    it("get components for style color MP version", () => {
        const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getComponentsForStyleColorMpVersion`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, style, color
            },
        }

        cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14287);
            expect(response.body.internalMessage).to.equal(Constants.PPS_COMPONENTS_FOR_STYLE_COLOR_OP_VERSION_RETRIEVED_SUCCESSFULLY);
            components = response.body.data.components;
        })
    });

    it("get master PO details id by style color and master PO number", () => {
        const getMasterPoDetailsIdByStyleColorMasterPoNumber = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoDetailsIdByStyleColorMasterPoNumber`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber, style, color
            },
        }

        cy.request(getMasterPoDetailsIdByStyleColorMasterPoNumber).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14239);
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_DETAILS_ID_FOUND);
            masterPoDetailsId = response.body.data
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
                masterPoNumber, style, color, plantCode
            },
        }

        cy.request(getRmComponentsMappingForStyleColor).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(12202);
            expect(response.body.internalMessage).to.equal(Constants.PPS_JOB_GROUPS_ASSIGNMENTS_DATA_RETRIEVED_SUCCESSFULLY);
            rmComponentsData = response.body.data;
        })
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
        }

        cy.request(getRmComponentsMappingForStyleColor).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14304);
            expect(response.body.internalMessage).to.equal(Constants.PPS_DATA_FOUND);
            fabricDetails = response.body.data;
        })
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
        }

        cy.request(createOrUpdateComponentGroup).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14267);
            expect(response.body.internalMessage).to.equal(Constants.PPS_COMPONENT_GROUPS_ASSIGNED_SUCCESSFULLY);
        })
    });

});

describe("7) Replacement group", () => {
    let masterPoColors = null;

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
            masterPoColors = response.body.data[0].color;
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
                plantCode, styles: [style], colors: [masterPoColors]
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

        cy.request(getReplacementGroupsByMasterPo).then((response) => {
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
                masterPoNumber, style, color: masterPoColors
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
                components: ["FR"],
                createdUser: "dev",
                fabricCategory: "SLV",
                groupType: "REPLACEMENT",
                masterPoDetailsId,
                materialItemCode: "SFPFMENVFB1 001",
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

        cy.request(getReplacementGroupsByMasterPo).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14559);
            expect(response.body.internalMessage).to.equal(Constants.PPS_REPLACEMENT_GROUPS_RETRIEVED_SUCCESSFULLY);
            expect(response.body.data.replacementGroupDetails[0].replacementGroupId).to.equal(replacementGroupId);
        });
    });

});

describe("8) Sub PO Creation", () => {

    // Sub PO creation menu
    let masterPoQuantitiesSummary;
    let moFeaturesSizeQuantitiesDetailsForMasterPo;
    let masterPoHeaderDetails;

    it("get master PO quantity summery", () => {
        const getMasterPoQuantitiesSummary = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_SUMMERY_RETRIEVED_SUCCESSFULLY);
            masterPoQuantitiesSummary = response.body.data;
        })
    })

    it("get MO features size quantities details for Master PO", () => {
        const getMoFeaturesSizeQuantitiesDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_FEATURES_DETAILS_DATA_FOUND);
            moFeaturesSizeQuantitiesDetailsForMasterPo = response.body.data[0];
        })
    })

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
            masterPoHeaderDetails = response.body.data;
        })
    })

    it("create production order", () => {
        const createProductionOrder = {
            method: "POST",
            url: `/${ppsService}/production-order/createProductionOrder`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_SUB_PO_CREATED_SUCCESSFULLY);
        })
    })

    it("get master PO quantity summery", () => {
        const getMasterPoQuantitiesSummary = {
            method: "POST",
            url: `/${ppsService}/MasterProductionOrderController/getMasterPoQuantitiesSummary`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_SUMMERY_RETRIEVED_SUCCESSFULLY);
        })
    })

    it("get MO features size quantities details for Master PO", () => {
        const getMoFeaturesSizeQuantitiesDetailsForMasterPo = {
            method: "POST",
            url: `/${ppsService}/production-order/getMofeaturesSizeQuantitesDetailsForMasterPo`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_FEATURES_DETAILS_DATA_FOUND);
        })
    })

    it("get sub PO numbers for master PO number", () => {
        const getSubPoNumbersForMasterPONumber = {
            method: "POST",
            url: `/${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_NUMBERS_DROPDOWN_INFO_RETRIEVED_SUCCESSFULLY);
            subPoNumber = response.body.data[0].poNumber;
        })
    })

    it("get PO quantity summery", () => {
        const getPoQuantitySummery = {
            method: "POST",
            url: `/${ppsService}/production-order/getPoQuantitiesSummary`,
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
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_SUMMERY_RETRIEVED_SUCCESSFULLY);
        })
    });

});

describe('9) Sub Ratio PO', () => {

    let subPoNumbers = [];
    let schedules = [];
    let poSummaryData;
    let componentGroupRatios;
    let fabricMaxPlies;
    let ratios;

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

    context('Select Sub PO Numbers', () => {
        before(() => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
                headers: {
                    authorization: authorization,
                },
                body: {masterPoNumber: masterPoNumber}
            }
            cy.request(options).then(response => {
                subPoNumbers = response.body.data;
            })
        });

        it('Get Schedules and Colors For Sub PO', () => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getSchedulesAndColorsForSubPo`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber}
            }
            cy.request(options).then(response => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_STYLE_SCHEDULE_COLOR_FOR_PO_SUCCESS);

            })
        })

        it('Get PO Summary and Ratio CG Summary', () => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order-ratios/getPoSummaryAndRatioCGSummary`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber}
            }
            cy.request(options).then(response => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_SUMMARY_RATIO_COMPONENT_GROUP_SUMMARY_SUCCESS);

                poSummaryData = response.body.data.poSummary[0].summaryData;
                componentGroupRatios = response.body.data.componentGroupInfoForPO.ratios;
                ratios = response.body.data.ratioCGSummary.ratios;
            })
        })


    })

    context('Add Ratio for PO', () => {
        let totalQuantities = {};
        let defaultSizes = [];
        let defaultColors = [];

        before(() => {
            let cuttingWastage = poSummaryData["CUTTING_WASTAGE"];
            let originalQuantity = poSummaryData["ORIGINAL_QUANTITY"];
            let extraShipmentQuantiity = poSummaryData["EXTRA_SHIPMENT"];
            let sampleQuantity = poSummaryData["SAMPLE"];

            cuttingWastage.map((item) => {
                if (totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                } else {
                    totalQuantities[item.size] = item.quantity;
                }
            })
            originalQuantity.map((item) => {
                if (totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                } else {
                    totalQuantities[item.size] = item.quantity;
                }
            });
            extraShipmentQuantiity.map((item) => {
                if (totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                } else {
                    totalQuantities[item.size] = item.quantity;
                }
            });
            sampleQuantity.map((item) => {
                if (totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                } else {
                    totalQuantities[item.size] = item.quantity;
                }
            });
        });

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
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getDefaultSizesOfPo`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber, plantCode: plantCode}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DEFAULT_SIZES_SUCCESS);

                defaultSizes = response.body.data;
            })
        })

        it('Get Colors info for PO', () => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getColorsInfoForPo`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber, plantCode: plantCode}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_COLORS_SUCCESS);

                defaultColors = response.body.data;
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
            const options = {
                method: 'POST',
                url: `/${ppsService}/MasterProductionOrderController/getMasterPoSerialDesc`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumbers: [subPoNumbers[0].poNumbers]}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DETAILS_SUCCESS);
            })
        })


        it('Get Schedules info for PO', () => {
            // Response will be arrays of schedules.
            // Schedule:: {schedule: "xxx", masterPoDetailId: "xxx"}
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order/getSchedulesInfoForPo`,
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber, plantCode: plantCode}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.data).to.be.an('array');
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_SCHEDULES_SUCCESS);

                schedules = response.body.data;
            })
        })

        it('Get Ratio Fabric Category Max Files Default', () => {
            const options = {
                method: 'POST',
                url: `/${ppsService}/production-order-ratios/getRatioFabricCategoryMaxPliesDefault`,
                headers: {
                    authorization: authorization,
                },
                body: {poDetailId: schedules[0].masterPoDetailId}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.be.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.data).to.be.an('array');
                expect(response.body.internalMessage).to.equal(Constants.PPS_FABRIC_DEFAULT_MAX_PILES_SUCCESS);
                fabricMaxPlies = response.body.data;
            })
        })

        it('Create Component Group Based Ratio', () => {

            // Assigning quantities Best Ratio
            const qtyBySizes = defaultSizes.map((item) => ({...item, qty: totalQuantities[item.size]}));
            const sortedQtyBySizes = qtyBySizes;
            sortedQtyBySizes.sort((a, b) => a.qty - b.qty);

            const colorRatios = defaultColors.map((item) => ({color: item.color, ratio: 1 }))
            // Using least value as the ratio piles

            const leastQty = sortedQtyBySizes[0].qty;
            const sizeRatios = qtyBySizes.map((item) => {
                let ratio = item.qty / leastQty;
                return {
                    size: item.size,
                    ratio: Math.ceil(ratio)
                }
            })


            componentGroupRatios.map((ratio, ratioIndex) => {

                const options = {
                    method: 'POST',
                    url: '/production-planning-service/production-order-ratios/createComponentGroupBasedRatio',
                    body: {
                        poNumber: subPoNumbers[0].poNumber,
                        ratioManualCode: `${ratioIndex}`,
                        ratioType: "NORMAL",
                        cutType: "NORMAL",
                        ratioPlies: leastQty,
                        ratioDescription: `Testing ${ratioIndex}`,
                        createdUser: "dev",
                        plantCode: "ENV",
                        colorRatios: colorRatios,
                        sizeRatios: sizeRatios,
                        fabricCategoryMaxPlies: fabricMaxPlies,
                        cgId: [
                            ratio.cgId
                        ],
                        ratioCategory: "CG"
                    }
                }

                cy.request(options).then((response) => {
                    expect(response.status).to.be.equal(201);
                    expect(response.body.status).to.be.true;
                    expect(response.body.internalMessage).to.equal(Constants.PPS_SUB_PO_RATIO_SUCCESS);
                })
            })


        })
    })


});

describe("10) Sub PO Maker Versions", () => {

    let markerTypeId = "";
    let ratioWiseComponents;

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
                //subPoNumber = data[0].poNumber;
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
        const getMarkerVersionsForPo = {
            method: "POST",
            url: `${ppsService}/marker-versions/getMarkerVersionsForPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                poNumber: subPoNumber,
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
                ratioWiseComponents = data;
            });
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

                if (response.body.status == true) {
                    expect(response.body.internalMessage).to.equal(Constants.PPS_MARKER_VERSION_SAVED_SUCCESSFULLY);
                    const assertCreateSampleResponse = assertSchema(schemas)("createMarkerVersion", "1.0.0");
                    expect(() => {
                        assertCreateSampleResponse(response.body);
                    }).not.throw();
                }
            });
        });
    });
});

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
        const options = {
            method: 'POST',
            url: '/production-planning-service/marker-versions/getMarkersSummeryDataForPo',
            headers: {authorization: authorization},
            body: {poNumber: subPoNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MARKERS_SUMMARY_DATA_SUCCESS);
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

    it("Get Features of Operation Type - PACKING_LIST_FEATURES", () => {
        const getFeaturesOfOperationType = {
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

        cy.request(getFeaturesOfOperationType).then((response) => {
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

            let packingListOriginalQty = response.body.data.packingListOriginalQty;
            expect(packingListOriginalQty).to.be.an("object");
            expect(packingListOriginalQty.ORIGINAL_QUANTITY).to.be.an("array");
            expect(packingListOriginalQty.EXTRA_SHIPMENT).to.be.an("array");

            // ORIGINAL_QUANTITY
            // aggregate each size into key:value
            const aggregatedOriginalQuantity: { [id: string]: number } = {};
            for (let extraShipmentData of packingListOriginalQty.ORIGINAL_QUANTITY) {
                if (aggregatedOriginalQuantity[extraShipmentData.size] >= 0) {
                    aggregatedOriginalQuantity[extraShipmentData.size] =
                        aggregatedOriginalQuantity[extraShipmentData.size] + extraShipmentData.quantity;
                } else {
                    aggregatedOriginalQuantity[extraShipmentData.size] = extraShipmentData.quantity;
                }
            }
            //  compare aggregated result with input from additional qty screen
            for (let [size, extraShipmentAmount] of Object.entries(aggregatedOriginalQuantity)) {
                expect(orderQuantitiesData.ORIGINAL_QUANTITY[size].originalOrdetqty).to.be.equal(
                    extraShipmentAmount,
                    `Original quantity is correct for size ${size}`
                );
            }

            // EXTRA_SHIPMENT
            // aggregate each size into key:value
            const aggregatedExtraShipment: { [id: string]: number } = {};
            for (let extraShipmentData of packingListOriginalQty.EXTRA_SHIPMENT) {
                if (aggregatedExtraShipment[extraShipmentData.size] >= 0) {
                    aggregatedExtraShipment[extraShipmentData.size] =
                        aggregatedExtraShipment[extraShipmentData.size] + extraShipmentData.quantity;
                } else {
                    aggregatedExtraShipment[extraShipmentData.size] = extraShipmentData.quantity;
                }
            }
            //  compare aggregated result with input from additional qty screen
            for (let [size, extraShipmentAmount] of Object.entries(aggregatedExtraShipment)) {
                expect(orderQuantitiesData.EXTRA_SHIPMENT[size].quantity).to.be.equal(
                    extraShipmentAmount,
                    `Extra shipment quantity is correct for size ${size}`
                );
            }
        });
    });

    it("Get Feature Values for Selected Feature", () => {
        const getFeatureValuesForSelectedFeatures = {
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

        cy.request(getFeatureValuesForSelectedFeatures).then((response) => {
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
        const getMpPackListSummaryForFeatures = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getMpPackListSummaryForFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                schedule: schedule,
            },
        };

        cy.request(getMpPackListSummaryForFeatures).then((response) => {
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
        const getPackMethodDetailsForFeatures = {
            method: "POST",
            url: `${ppsService}/packing-ratio/getPackMethodDetailsForFeatures`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                plantCode: plantCode,
                schedule: schedule,
            },
        };

        cy.request(getPackMethodDetailsForFeatures).then((response) => {
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
                schedule: schedule,
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
    it("Check Sub Po Ready For Cut Generation", () => {
        let count = 0;
        cy.wait(10000);
        const checkSubPoReadyForCutGeneration = () => {
            cy.request({
                method: "POST",
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/cut-docket-generation/checkSubPoReadyForDocketGeneration`,
                body: {
                    poNumber: subPoNumber,
                    plantCode: plantCode,
                },
            }).then((response) => {
                expect(response.status).to.equal(201);
                if (response.body.status === false) {
                    count++;
                    if (count < Constants.WASTAGE_SUB_PO_READY_FOR_DOCKET_GEN_MAX_ATTEMPT) {
                        cy.log(`checkSubPoReadyForDocketGeneration failed - ${response.body.internalMessage}`);
                        cy.wait(15000);
                        checkSubPoReadyForCutGeneration();
                    } else {
                        throw new Error("Check Sub Po Ready For docket Generation - FAILED");
                    }
                }
            });
        };

        checkSubPoReadyForCutGeneration();
    });

    it("Generating Dockets for Sub PO", () => {
        cy.wait(1000);
        cy.request({
            method: "POST",
            headers: {
                authorization: authorization,
            },
            url: `/${ppsService}/cut-docket-generation/generateDocketsForSubPo`,
            body: {
                subPo: subPoNumber,
                userName: userName,
                plantCode: plantCode,
            },
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body).has.property("internalMessage", Constants.PPS_GENERATE_DOCKETS_FOR_SUB_PO_MSG);
        });
        cy.request({
            method: "POST",
            headers: {
                authorization: authorization,
            },
            url: `/${ppsService}/production-order-ratios/displayRatioComponentGroupsForSubPO`,
            body: {
                poNumber: subPoNumber,
            },
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property("internalMessage", Constants.PPS_DISPLAY_RATIO_COMPONENT_GROUPS_FOR_SUB_PO);
        });
    });

    it("Get CutDocket Status For Sub Po Number", () => {
        let count = 0;
        const getCutDocketStatusForSubPoNumber = () => {
            cy.wait(10000);
            cy.request({
                method: "POST",
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/production-order/getCutDocketStatusForSubPoNumber`,
                body: {
                    poNumber: subPoNumber,
                    plantCode: plantCode,
                },
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.equal(true);
                expect(response.body).has.property("internalMessage", Constants.PPS_GET_CUT_DOCKET_STATUS_FOR_SUB_PO_NO_MSG);
                if (response.body.data.docsGenerated !== Constants.PPS_DOCKET_GEN_DONE) {
                    count++;
                    if (count < Constants.MAX_ATTEMPTS) {
                        cy.log(`checkSubPoReadyForDocketGeneration failed - ${response.body.internalMessage}`);
                        getCutDocketStatusForSubPoNumber();
                    } else {
                        throw new Error("Get CutDocket Status For Sub Po Number - FAILED");
                    }
                }
            });
        };

        getCutDocketStatusForSubPoNumber();
    });

    it("Check Sub Po Ready For Cut Generation", () => {
        let count = 0;
        cy.wait(12000);
        const checkSubPoReadyForCutGeneration = () => {
            cy.request({
                method: "POST",
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/cut-docket-generation/checkSubPoReadyForCutGeneration`,
                body: {
                    poNumber: subPoNumber,
                    plantCode: plantCode,
                },
            }).then((response) => {
                expect(response.status).to.equal(201);
                if (response.body.internalMessage !== Constants.PPS_CHECK_SUB_PO_READY_FOR_CUT_GENERATION_MSG) {
                    count++;
                    if (count < Constants.MAX_ATTEMPTS) {
                        cy.wait(5000);
                        checkSubPoReadyForCutGeneration();
                    } else {
                        throw new Error("Check Sub Po Ready For Cut Generation - FAILED");
                    }
                }
            });
        };

        checkSubPoReadyForCutGeneration();
    });
});

describe("Clear all the data for newly created PO", () => {
    //Since we have data we cleared it
    let oldRatios = null;
    // Delete dockets if we have any
    it("Delete Dockets", () => {
        const deleteDockets = {
            method: "POST",
            url: `${ppsService}/cut-docket-generation/deleteDockets`,
            headers: {authorization},
            body: {
                subPo: subPoNumber,
                userName: userName,
                plantCode: plantCode,
            },
        };

        cy.request(deleteDockets).then((response) => {
            expect(response.status).to.equal(201);
            if (response.body.status === true) {
                expect(response.body.internalMessage).to.equal(Constants.PPS_DOCKET_DELETE_SUCCESS_MSG);
            }
        });
    });

    it("Wait until dockets are deleted", () => {
        let count = 0;
        cy.wait(10000);
        const getCutDocketStatusForSubPoNumber = () => {
            cy.request({
                method: "POST",
                headers: {
                    authorization: authorization,
                },
                url: `/${ppsService}/production-order/getCutDocketStatusForSubPoNumber`,
                body: {
                    poNumber: subPoNumber,
                    plantCode: plantCode,
                },
            }).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.data).to.be.an("object");
                if (response.body.data.docsGenerated !== "OPEN") {
                    count++;
                    if (count < Constants.MAX_ATTEMPTS) {
                        cy.log(`Docket deletion not complete`);
                        cy.wait(5000);
                        getCutDocketStatusForSubPoNumber();
                    } else {
                        throw new Error("Check Sub Po Ready For docket Generation - FAILED");
                    }
                }
            });
        };

        getCutDocketStatusForSubPoNumber();
    });

    it("Delete Markers", () => {
        // Check raios and markers for the given PO
        const getMarkerVersionsForPoDelete = {
            method: "POST",
            url: `${ppsService}/marker-versions/getMarkerVersionsForPo`,
            headers: {
                authorization: authorization,
            },
            body: {
                poNumber: subPoNumber,
            },
        };

        cy.request(getMarkerVersionsForPoDelete).then((response) => {
            expect(response.status).to.equal(201);
            if (response.body.status === true && response.body.data && response.body.data.length > 0) {
                for (const eachRatio of response.body.data) {
                    // Get each marker version
                    for (const markerVersion of eachRatio.markerVersions) {
                        // Delete marker version
                        const markerDeleteOptions = {
                            method: "POST",
                            url: `${ppsService}/marker-versions/deleteMarkerVersion`,
                            headers: {authorization},
                            body: {
                                markerVersionId: markerVersion.markerVersionId,
                                updatedUser: userName,
                                versionFlag: markerVersion.versionFlag,
                            },
                        };

                        cy.request(markerDeleteOptions).then((response) => {
                            expect(response.status).to.equal(201);
                        });
                    }
                }
            }
        });
    });

    it("Delete Ratios", () => {
        const getPOSummaryandRatioForDelete = {
            method: "POST",
            url: `/${ppsService}/production-order-ratios/getPoSummaryAndRatioCGSummary`,
            headers: {
                authorization: authorization,
            },
            body: {poNumber: subPoNumber},
        };
        cy.request(getPOSummaryandRatioForDelete).then((response) => {
            expect(response.status).to.equal(201);
            //expect(response.body.status).to.be.true;
            //expect(response.body.internalMessage).to.equal(Constants.PPS_SUMMARY_RATIO_COMPONENT_GROUP_SUMMARY_SUCCESS);

            oldRatios = response.body.data.ratioCGSummary.ratios;

            for (let ratio of oldRatios) {
                const ratioDeleteOptions = {
                    method: "POST",
                    url: `${ppsService}/production-order-ratios/deleteRatio`,
                    headers: {authorization},
                    body: {
                        ratioId: ratio.ratioId,
                        updatedUser: "dev",
                        versionFlag: ratio.versionFlag,
                    },
                };

                cy.request(ratioDeleteOptions).then((response) => {
                    expect(response.status).to.equal(201);
                    expect(response.body.status).to.true;
                });
            }
        });
    });

    it("Delete PO", () => {
        // Delete PO
        const poDelReq = {
            method: "POST",
            url: `/${ppsService}/production-order/deleteProductionOrder`,
            headers: {
                authorization: authorization,
            },
            body: {
                poNumber: subPoNumber,
            },
        };

        cy.request(poDelReq).then((response) => {
            cy.log(response.body);
            expect(response.status).to.equal(201);
            expect(response.body.status).to.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_DELETED_SUCCESSFULLY);
        });
    });

    it("Delete Component groups", () => {
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

        cy.request(getReplacementGroupsByMasterPo).then((getReplacementGroupsResponse) => {
            expect(getReplacementGroupsResponse.status).to.equal(201);
            const deleteReplacementGroup = {
                method: "POST",
                url: `/${ppsService}/component-group/deleteReplacementGroup`,
                headers: {
                    authorization: authorization,
                },
                body: {
                    groupType: "REPLACEMENT",
                    replacementGroupId: getReplacementGroupsResponse.body.data.replacementGroupDetails[0].replacementGroupId,
                    updatedUser: userName,
                    versionFlag: 1,
                },
            }

            cy.request(deleteReplacementGroup).then((response) => {
                expect(response.status).to.equal(201);
            })
        });

        // delete component groups
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
    });

    it("Remove additional Quantities", () => {
        cy.wait(15 * 1000)
        const createOrderQuantityUpdate = {
            method: "POST",
            url: `/${ppsService}/OrderQuantityUpdateController/createOrderQuantityUpdate`,
            headers: {
                authorization: authorization,
            },
            body: {
                masterPoNumber: masterPoNumber,
                style: addAdditionalQtyStyle,
                poNumber: "",
                cuttingPercentage: 1,
                createdUser: userName,
                updatedUser: userName,
                poQuantities: poQuantities, // just pass values
                orderQtyTypeDetails: [],
            },
        };
        cy.request(createOrderQuantityUpdate).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.errorCode).to.equal(14829);
            expect(response.body.internalMessage).to.equal(Constants.PPS_ORDER_QUANTITY_CREATED_UPDATED_SUCCESSFULLY);
        });
    });
});

