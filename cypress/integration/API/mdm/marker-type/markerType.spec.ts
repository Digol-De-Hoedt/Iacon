/// <reference types="Cypress" />
import {api, schemas} from "../../../../../schema";
import {assertSchema} from "@cypress/schema-tools";

xdescribe("Schemas testing Marker Type endpoints with CRUD operations", () => {
    const userName = Cypress.env('userName')
    const token = Cypress.env('token');
    const authorization = ""//`bearer ${token}`;

    // data for new marker
    const markerType = `test${Date.now().toString(36)}`
    const markerDesc = `Test marker - ss`

    let firstMarkerTypeData = undefined // set after get list


    it("Create new Marker Type", () => {
        const options = {
            method: 'POST',
            url: `/marker-type/createMarkerType`,
            headers: {
                authorization: authorization
            },
            body: {
                markerType: markerType,
                description: markerDesc,
                createdUser: userName
            }
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Marker Type Created Successfully");
            expect(response.body.status).to.be.true

            expect(response.body.data.createdUser).to.be.equal(userName)
            expect(response.body.data.markerType).to.be.equal(markerType)
            expect(response.body.data.description).to.be.equal(markerDesc)
            expect(response.body.data.versionFlag).to.be.equal(1)

            const assertCreateSampleResponse = assertSchema(schemas)('PostCreateMarkerTypeResponse', '1.0.0');
            expect(() => {
                assertCreateSampleResponse(response.body)
            }).not.throw();

        })
    })

    it("Get Marker Type List", () => {
        const options = {
            method: 'POST',
            url: `/marker-type/getAllMarkerTypes`,
            headers: {
                authorization: authorization
            }
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.equal(true);
            expect(response.body).have.property('data');
            expect(response.body).has.property('internalMessage', 'Data found');

            const assertCreateSampleResponse = assertSchema(schemas)('PostGetAllMarkerTypeResponse', '1.0.0');
            expect(() => {
                assertCreateSampleResponse(response.body)
            }).not.throw();

            firstMarkerTypeData = response.body.data[0]
            firstMarkerTypeData.updatedUser = userName
        })
    })

    it("De-Activate Marker Type", () => {
        const options = {
            method: 'POST',
            url: `/marker-type/deActivateMarkerType`,
            headers: {
                authorization: authorization
            },
            body: firstMarkerTypeData
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Marker Type Deactivated Successfully");
            expect(response.body.status).to.be.true

            const assertCreateSampleResponse = assertSchema(schemas)('PostDeActivateMarkerTypeResponse', '1.0.0');
            expect(() => {
                assertCreateSampleResponse(response.body)
            }).not.throw();
        })
    })

    it("Re-Activate Marker Type", () => {
        const options = {
            method: 'POST',
            url: `/marker-type/deActivateMarkerType`,
            headers: {
                authorization: authorization
            },
            body: {...firstMarkerTypeData, versionFlag: firstMarkerTypeData.versionFlag + 1}
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Marker Type Activated Successfully");
            expect(response.body.status).to.be.true

            const assertCreateSampleResponse = assertSchema(schemas)('PostDeActivateMarkerTypeResponse', '1.0.0');
            expect(() => {
                assertCreateSampleResponse(response.body)
            }).not.throw();
        })
    })
})