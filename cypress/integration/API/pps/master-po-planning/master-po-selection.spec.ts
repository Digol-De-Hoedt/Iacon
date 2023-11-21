/// <reference types = "Cypress"/>
import { step } from "mocha-steps";
import { Constants } from "../../../../../common/constants";

xdescribe("Automate Master PO Planning", () => {
	const userName = Cypress.env("userName");
	// const token = Cypress.env("token");
	const authorization = `Bearer ${Cypress.env("token")}`;
	const plantCode = "AIP";

	// select values for process
	let selectedPoData = {};

	step("01 - Testing Master PO Selection", () => {
		const getPoRelatedStyles = {
			method: "POST",
			url: `/order-management-service/order-management-service/getPoRelatedStyles`,
			headers: {
				authorization: authorization,
			},
			body: {
				plantCode: plantCode,
			},
		};

		const getAllMasterProductionOrdersForStyleScheduleColor = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getAllMasterProductionOrdersForStyleScheduleColor`,
			headers: {
				authorization: authorization,
			},
			body: {
				color: [],
				schedule: [],
				plantCode: plantCode,
			},
		};

		cy.request(getPoRelatedStyles).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Style retrieved successfully");
			expect(response.body.status).to.be.true;
		});

		cy.request(getAllMasterProductionOrdersForStyleScheduleColor).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Master Po Details Found");
			expect(response.body.status).to.be.true;
			expect(response.body.data).to.be.an("array");

			selectedPoData["selectedMasterPo"] = response.body.data[1];
			cy.log(`selected Master PO is`);
			cy.log(`${JSON.stringify(selectedPoData["selectedMasterPo"], null, 2)}`);
		});
	});

	step("02.1 - Testing Operation Routing - Get default data", () => {
		expect(selectedPoData["selectedMasterPo"]).to.be.an("object", "Data selected from Master PO is available");

		const getDefaultStylesOfMasterPo = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getDefaultStylesOfMasterPo`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: selectedPoData["selectedMasterPo"].masterPoNumber,
			},
		};
		cy.request(getDefaultStylesOfMasterPo).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Styles Retrieved Sucessfully");
			expect(response.body.status).to.be.true;
			expect(response.body.data).to.be.an("array");
		});

		const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: selectedPoData["selectedMasterPo"].masterPoNumber,
			},
		};
		cy.request(getMosFeaturesAndMasterPoHeaderDetailsForMasterPo).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal(Constants.PPS_MASTER_PO_HEADER_DETAILS_SUCCESS);
			expect(response.body.status).to.be.true;
			expect(response.body.data).to.be.an("object");
		});

		const getColorsOfMasterPoAndStyle = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getColorsOfMasterPoAndStyle`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: selectedPoData["selectedMasterPo"].masterPoNumber,
				plantCode: plantCode,
				style: selectedPoData["selectedMasterPo"].style,
			},
		};
		cy.request(getColorsOfMasterPoAndStyle).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Colors retrieved for style and color");
			expect(response.body.status).to.be.true;
			expect(response.body.data).to.be.an("array");
		});

		const getVersionsForStyleColorFromSms = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getVersionsForStyleColorFromSms`,
			headers: {
				authorization: authorization,
			},
			body: {
				plantCode: plantCode,
				color: selectedPoData["selectedMasterPo"].color,
				style: selectedPoData["selectedMasterPo"].style,
			},
		};
		cy.log("getVersionsForStyleColorFromSms");
		cy.request(getVersionsForStyleColorFromSms).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Data Retrieved successfully");
			expect(response.body.status).to.be.true;
			cy.log(response.body.data);
			expect(response.body.data).to.be.an("array");

			const defaultVersions = Array.from(response.body.data).filter((i) => i["defaultOperation"] === true);
			expect(defaultVersions).to.have.lengthOf(1, "One default version received");

			selectedPoData["defaultVersion"] = defaultVersions[0];
		});

		const getSavedOperationVersionOfStyleColor = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getSavedOperationVersionOfStyleColor`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: selectedPoData["selectedMasterPo"].masterPoNumber,
				color: selectedPoData["selectedMasterPo"].color,
				style: selectedPoData["selectedMasterPo"].style,
			},
		};
		cy.request(getSavedOperationVersionOfStyleColor).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Operation version retrieved successfully");
			expect(response.body.status).to.be.true;
			cy.log(response.body.data);
			expect(response.body.data).to.be.a("string");

			selectedPoData["savedOperationVersion"] = response.body.data;
		});

        const getMasterPoDetails = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getMasterPoDetails`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoNumber: selectedPoData["selectedMasterPo"].masterPoNumber,
				color: selectedPoData["selectedMasterPo"].color,
				style: selectedPoData["selectedMasterPo"].style,
			},
		};
		cy.request(getMasterPoDetails).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Operation version retrieved successfully");
			expect(response.body.status).to.be.true;
			cy.log(response.body.data);
			expect(response.body.data).to.be.a("string");

			selectedPoData["savedOperationVersion"] = response.body.data;
		});
	});

	step("02.2 - Testing Operation Routing - Get record data", () => {
		expect(selectedPoData["selectedMasterPo"]).to.be.an("object", "Data selected from Master PO is available");
		expect(selectedPoData["defaultVersion"]).to.be.an("object", "Data selected for Default Version is available");

		const getRecordById = {
			method: "POST",
			url: `style-management-service/job-group-sequencing/getRecordById`,
			headers: {
				authorization: authorization,
			},
			body: {
				_id: selectedPoData["defaultVersion"]._id,
			},
		};
		cy.request(getRecordById).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Data Retrieved successfully");
			expect(response.body.status).to.be.true;
		});

		const getVersionsForStyleColorFromSms = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/getVersionsForStyleColorFromSms`,
			headers: {
				authorization: authorization,
			},
			body: {
				color: selectedPoData["selectedMasterPo"].color,
				style: selectedPoData["selectedMasterPo"].style,
				plantCode: plantCode,
				variant: selectedPoData["savedOperationVersion"],
			},
		};
		cy.request(getVersionsForStyleColorFromSms).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.be.oneOf(["Data Retrieved successfully", "No Records Found"]);
			expect(response.body.status).to.be.a("boolean");
		});

		cy.log("Save data with default values");

		const updateOperationsVersionId = {
			method: "POST",
			url: `production-planning-service/MasterProductionOrderController/updateOperationsVersionId`,
			headers: {
				authorization: authorization,
			},
			body: {
				masterPoDetailsId: selectedPoData["selectedMasterPo"].masterPoNumber,
				operationsVersionId: selectedPoData["savedOperationVersion"],
				updatedUser: userName,
				versionFlag: selectedPoData["selectedMasterPo"].versionFlag,
			},
		};
		cy.request(updateOperationsVersionId).then((response) => {
			expect(response.status).to.equal(201);
			expect(response.body.internalMessage).to.equal("Given operations versionId is updated successfull");
			expect(response.body.status).to.be.true;
		});
	});
});
