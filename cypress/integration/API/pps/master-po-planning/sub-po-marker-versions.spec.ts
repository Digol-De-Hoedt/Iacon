/// <reference types = "Cypress"/>

import { assertSchema } from "@cypress/schema-tools";
import { Constants } from "../../../../../common/constants";
import { schemas } from "../../../../../schema";

xdescribe("Automate Sub PO Maker Versions", () => {
	const userName = Cypress.env("userName");
	const authorization = `Bearer ${Cypress.env("token")}`;
	// const token = Cypress.env("token");
	// const plantCode = Cypress.env("plantCode");

	let masterPoNumber = "8528eb49-146d-49a2-887f-b6a575828e1a";
	let subPoNumber = "";
	let markerTypeId = "";
	let ratioWiseComponentGroupId = "";

	it("Get Sub-PO Numbers Dropdown for Master PO Number", () => {
		const getSubPoNumbersDropDownForMasterPoNumber = {
			method: "POST",
			url: `production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber`,
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
				expect(response.body.internalMessage).to.equal("Po numbers dropdown info retrieved successfully");
				expect(response.body.status).to.be.true;

				const assertCreateSampleResponse = assertSchema(schemas)("getSubPoNumbersDropDownForMasterPoNumber", "1.0.0");
				expect(() => {
					assertCreateSampleResponse(response.body);
				}).not.throw();

				return response.body.data;
			})
			.then((data) => {
				expect(data).to.be.an("array").and.have.length.greaterThan(0);
				subPoNumber = data[0].poNumber;
			});
	});

	it("Get MOS Features And Master PO Header Details for Master PO", () => {
		const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
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

	it("MDM/getAllFabricTypes", () => {
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
			expect(response.body.internalMessage).to.equal("Fabric Types data retrieved successfully");
			expect(response.body.status).to.be.true;

			const assertCreateSampleResponse = assertSchema(schemas)("getAllFabricTypes", "1.0.0");
			expect(() => {
				assertCreateSampleResponse(response.body);
			}).not.throw();
		});
	});

	it("MDM/getAllActiveMarkerTypes", () => {
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
				expect(response.body.internalMessage).to.equal("Data found");
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
			url: `production-planning-service/marker-versions/getMarkerVersionsForPo`,
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
				expect(response.body.internalMessage).to.equal("Marker Details for given po retrieved successfully!!!");
				expect(response.body.status).to.be.true;
				expect(response.body.data).to.be.an("array").and.have.length.greaterThan(1);

				const assertCreateSampleResponse = assertSchema(schemas)("getMarkerVersionsForPo", "1.0.0");
				expect(() => {
					assertCreateSampleResponse(response.body);
				}).not.throw();
				return response.body.data;
			})
			.then((data) => {
				expect(data).to.be.an("array").and.have.length.greaterThan(0);
				ratioWiseComponentGroupId = data[0].ratioWiseComponentGroupId;
			});
	});

	it("PPS/createMarkerVersion", () => {
		const createMarkerVersion = {
			method: "POST",
			url: `production-planning-service/marker-versions/createMarkerVersion`,
			headers: {
				authorization: authorization,
			},
			body: {
				markerVersion: "1",
				patternVersion: "1",
				markerTypeId: markerTypeId,
				shrinkage: 1,
				width: 1,
				length: 1,
				efficiency: 1,
				endAllowance: 1,
				perimeter: 1,
				remark1: "1",
				ratioWiseComponentGroupId: ratioWiseComponentGroupId,
				defaultMarkerVersion: true,
				createdUser: userName,
			},
		};

		cy.request(createMarkerVersion).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Marker version saved successfully!");
			expect(response.body.status).to.be.true;

			const assertCreateSampleResponse = assertSchema(schemas)("createMarkerVersion", "1.0.0");
			expect(() => {
				assertCreateSampleResponse(response.body);
			}).not.throw();
		});
	});
});
