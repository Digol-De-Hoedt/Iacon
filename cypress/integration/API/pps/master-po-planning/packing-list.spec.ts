/// <reference types = "Cypress"/>

import { assertSchema } from "@cypress/schema-tools";
import { Constants } from "../../../../../common/constants";
import { schemas } from "../../../../../schema";

xdescribe("Automate Packing List", () => {
	const userName = Cypress.env("userName");
	// const token = Cypress.env("token");
	const authorization = ""; //`bearer ${token}`;
	const plantCode = Cypress.env("plantCode");
	const masterPoNumber = "8528eb49-146d-49a2-887f-b6a575828e1a";
	const operationCategory = "SEWING_JOB_FEATURE";

	let schedule = [];
	let markerTypeId = "";
	let ratioWiseComponentGroupId = "";

	it("Get MOS Features And Master PO Header Details for Master PO", () => {
		const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
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
			url: `production-planning-service/job-preference/getFeaturesOfOperationType`,
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
			expect(response.body.internalMessage).to.equal("Job Type Features Received Successfully!");
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
			url: `production-planning-service/job-preference/getFeaturesOfOperationType`,
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
			expect(response.body.internalMessage).to.equal("Job Type Features Received Successfully!");
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
			url: `production-planning-service/packing-ratio/getMpPackListSummary`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: masterPoNumber,
			},
		};

		cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Packing list summary retrievd successfully");
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
			url: `/production-planning-service/packing-ratio/getFeatureValuesForSelectedFeatures`,
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
			expect(response.body.internalMessage).to.equal("Features retrieved succesfully");
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
			url: `production-planning-service/packing-ratio/getMpPackListSummaryForFeatures`,
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
			expect(response.body.internalMessage).to.equal("Packing list summary retrievd successfully");
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
			url: `production-planning-service/packing-ratio/getPackMethodDetailsForFeatures`,
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
			expect(response.body.internalMessage).to.equal("Pack Method Details received successfully!!!");
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
			url: `production-planning-service/packing-ratio/getMpPackListSummaryForFeatures`,
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
			expect(response.body.internalMessage).to.equal("Packing list summary retrievd successfully");
			expect(response.body.status).to.be.true;

			const assertCreateSampleResponse = assertSchema(schemas)("getMpPackListSummary", "1.0.0");
			expect(() => {
				assertCreateSampleResponse(response.body);
			}).not.throw();
		});
	});
});
