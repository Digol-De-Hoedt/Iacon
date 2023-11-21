import {Constants} from "../../../../../common/constants";


xdescribe('Sub Ratio PO', () => {
    const authorization = `Bearer ${Cypress.env("token")}`;
    const masterPoNumber = "7307e92c-c54e-4263-b218-e5035d7642c8";
    const plantCode = Cypress.env('plantCode');

    let subPoNumbers = [];
    let schedules = [];
    let ratioId = null;


    let fabricMaxPlies;

    let poSummaryData;
    let componentGroupRatios = [];
    let ratios = [];

    it('Get Features of PO Number', () => {
        const options = {
            method: 'POST',
            url: '/production-planning-service/job-preference/getFeaturesOfPoNumber',
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
          url: '/production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo',
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
            url: '/production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber',
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
                url: '/production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber',
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
                url: '/production-planning-service/production-order/getSchedulesAndColorsForSubPo',
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
                url: '/production-planning-service/production-order-ratios/getPoSummaryAndRatioCGSummary',
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber}
            }
            cy.request(options).then(response => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;

                poSummaryData = response.body.data.poSummary[0].summaryData;
                componentGroupRatios = response.body.data.componentGroupInfoForPO.ratios;
                ratios = response.body.data.ratioCGSummary.ratios;
            })
        })

        it('Clearing up existing Ratios and Marker Versions', () => {
            ratios.map((ratio) => {
                if(ratio.markerId !== "") {
                    const markerDeleteOptions = {
                        method: 'POST',
                        url: `/production-planning-service/marker-versions/deleteMarkerVersion`,
                        headers: {authorization},
                        body: {
                            markerVersionId: ratio.markerId,
                            updatedUser: 'dev',
                            versionFlag: 1
                        }
                    }

                    cy.request(markerDeleteOptions).then(response => {
                        expect(response.status).to.equal(201);
                        expect(response.body.status).to.be.true;
                    })
                }

                const ratioDeleteOptions = {
                    method: 'POST',
                    url: `/production-order-ratios/deleteRatio`,
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
                })
            })
        })

    })

    xcontext('Add Ratio for PO', () => {
        let totalQuantities = {};
        let defaultSizes = [];

        before(() => {

            let cuttingWastage = poSummaryData['CUTTING_WASTAGE'];
            let originalQuantity = poSummaryData['ORIGINAL_QUANTITY'];


            cuttingWastage.map((item) => {
                if(totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                }else {
                    totalQuantities[item.size] = item.quantity;
                }
            })

            originalQuantity.map((item) => {
                if(totalQuantities.hasOwnProperty(item.size)) {
                    totalQuantities[item.size] += item.quantity;
                }else {
                    totalQuantities[item.size] = item.quantity;
                }
            })

        })

        it('Get Default Styles of Master PO', () => {
            const options = {
                method: 'POST',
                url: '/production-planning-service/MasterProductionOrderController/getDefaultStylesOfMasterPo',
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
                url: '/production-planning-service/production-order/getDefaultSizesOfPo',
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
                url: '/production-planning-service/production-order/getColorsInfoForPo',
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber, plantCode:plantCode }
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_COLORS_SUCCESS);

            })
        })



        it('Get Master PO Serial Description', () => {
            const options = {
                method: 'POST',
                url: '/production-planning-service/MasterProductionOrderController/getMasterPoSerialDesc',
                headers: {
                    authorization: authorization,
                },
                body: { masterPoNumbers: [masterPoNumber]}
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
                url: '/production-planning-service/MasterProductionOrderController/getMasterPoSerialDesc',
                headers: {
                    authorization: authorization,
                },
                body: { poNumbers: [subPoNumbers[0].poNumbers]}
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
                url: '/production-planning-service/production-order/getSchedulesInfoForPo',
                headers: {
                    authorization: authorization,
                },
                body: {poNumber: subPoNumbers[0].poNumber, plantCode:plantCode }
            }

            cy.request(options).then((response) => {
                expect(response.status).to.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.data).to.be.an('array');
                expect(response.body.internalMessage).to.equal(Constants.PPS_PO_SCHEDULES_SUCCESS);

                schedules = response.body.data;
            })
        })

        it('Get Ratio Fabric Category Max Files Default', ()=> {
            const options = {
                method: 'POST',
                url: '/production-planning-service/production-order-ratios/getRatioFabricCategoryMaxPliesDefault',
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

        it.skip('Create Component Group Based Ratio', () => {

            // Assigning quantities Best Ratio
            const qtyBySizes = defaultSizes.map((item) => ({...item, qty: totalQuantities[item.size]}));
            const sortedQtyBySizes = qtyBySizes;
            sortedQtyBySizes.sort((a,b) => a.qty - b.qty);

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
                        colorRatios: [
                            {
                                "color": "SFBlack",
                                "ratio": 1
                            }
                        ],
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

    xcontext('Delete Sub PO Ratio', () => {

        it('Delete Ratio', () => {
            const options = {
                method: 'POST',
                headers: {
                    authorization: authorization,
                },
                url: '/production-planning-service/production-order-ratios/deleteRatio',
                body: {ratioId: ratioId, updatedUser:"dev", versionFlag:1}
            }

            cy.request(options).then((response) => {
                expect(response.status).to.be.equal(201);
                expect(response.body.status).to.be.true;
                expect(response.body.data).to.be.true;
                expect(response.body.internalMessage).to.equal(Constants.PPS_SUB_PO_RATIO_DELETE_SUCCESS);
            })
        })
    })



});