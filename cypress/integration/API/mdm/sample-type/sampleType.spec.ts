import {api, schemas} from "../../../../../schema";
import {assertSchema} from "@cypress/schema-tools";

const mdmService = Cypress.env("mdm");

xdescribe("Testing API Endpoints Using Cypress", () => {

    let randomText = (Math.random() + 1).toString(36).substring(7);
    let name = 'test' + randomText;
    let simpleTypeID = null;
    let versionFlag = 0;

    it("GET All Sample types Request", () => {

        cy.request({
            method: 'POST',
            url: `/${mdmService}/sample-type/getAllSampleTypes`,
            body: {}
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).have.property('data');
            expect(response.body).has.property('internalMessage', 'Sample Types retrieved successfully');
        })

    });

    it("CREATE Sample types Request", () => {

        let desc = name + ' desc ';

        cy.request({
            method: 'POST',
            url: `${mdmService}/sample-type/saveSampleType`,
            body: {
                "sampleTypeCode": name,
                "sampleTypeDesc": desc,
                "createdUser": `${Cypress.env('userName')}`
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).have.property('data');
            expect(response.body).has.property('internalMessage', 'Sample Type created successfully');
            const assertCreateSampleResponse = assertSchema(schemas)('PostCreateSampleTypeResponse', '1.0.0');
            expect(() => {
                assertCreateSampleResponse(response.body)
            }).not.throw();
            simpleTypeID = response.body.data.sampleTypeId;
            versionFlag++;
        })

    });

    it("UPDATE Sample types Request", () => {

        let updatedDesc = name + ' updated';

        cy.request({
            method: 'POST',
            url: `${mdmService}/sample-type/saveSampleType`,
            body: {
                "sampleTypeCode": name,
                "sampleTypeDesc": updatedDesc,
                "createdUser": `${Cypress.env('userName')}`,
                "updatedUser": `${Cypress.env('userName')}`,
                "sampleTypeId": simpleTypeID,
                "isActive": true,
                "versionFlag": versionFlag
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            const assertUpdateSampleResponse = assertSchema(schemas)('PostUpdateSampleTypeResponse', '1.0.0');
            expect(() => {
                assertUpdateSampleResponse(response.body)
            }).not.throw();
            expect(response.body).has.property('internalMessage', 'Sample Type updated successfully');
            versionFlag++;
        })

    });

    it("Deactivate Sample types Request", () => {
        cy.request({
            method: 'POST',
            url: `/${mdmService}/sample-type/activateOrDeactivateSampleTypeBySampleTypeCode`,
            body: {
                "sampleTypeCode": name,
                "versionFlag": versionFlag
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', 'Sample Type is de-activated successfully');
            versionFlag++;
        })

    });

    it("Activate Sample types Request", () => {
        cy.request({
            method: 'POST',
            url: `/${mdmService}/sample-type/activateOrDeactivateSampleTypeBySampleTypeCode`,
            body: {
                "sampleTypeCode": name,
                "versionFlag": versionFlag
            }
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', 'Sample Type is activated successfully');
        })

    });

    it("Get Sample types by code", () => {
        cy.request({
            method: 'POST',
            url: `/${mdmService}/sample-type/getSampleTypeBySampleTypeCode`,
            body: {"sampleTypeCode": "test1"}
        }).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).has.property('internalMessage', 'Sample Type retrieved successfully');
        })

    });


})