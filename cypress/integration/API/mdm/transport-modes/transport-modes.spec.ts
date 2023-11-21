import { api } from '../../../../../schema';

const assertCreateTransportMode = api.assertSchema('CreateTransportModeResponse', '1.0.0');
const assertGetAllTransportMode = api.assertSchema('GetAllTransportModeResponse', '1.0.0');
const assertDisableTransportMode = api.assertSchema('DisableTransportModeResponse', '1.0.0');

xdescribe("Testing Transport Modes", () => {

    let name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    let transportModeId = null;


    it.skip("Get All Transport Modes", () => {
        const options = {
            method: 'POST',
            url: `/transport-modes/getAllTransportModes`
        }

        cy.request(options).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Transport Modes Records Found");
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(() => assertGetAllTransportMode(response.body)).not.throw();

        })
    })

    it.skip("Create a Transport Mode", () => {

        const rOptions = {
            method: 'POST',
            url: '/transport-modes/createTransportMode',
            body: {
                "transportMode": name,
                "createdUser": "dev"
            }
        }

        cy.request(rOptions).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Transport Mode Created Successfully");
            expect(response.body.status).to.be.true
            expect(() => assertCreateTransportMode(response.body)).not.throw();
            transportModeId = response.body.data.transportModeId;
        })
    })

    it.skip("Disable a Transport Mode", () => {
        const rOptions = {
            method: 'POST',
            url: '/transport-modes/deleteTransportMode',
            body: {
                "transportModeId": transportModeId,
                "transportMode": name,
                "isActive": true,
                "createdAt": "2021-10-29T14:51:43.475Z",
                "createdUser": "dev",
                "updatedAt": "2021-10-29T14:51:43.475Z",
                "updatedUser": "dev",
                "versionFlag": 1
            }
        }

        cy.request(rOptions).then(response => {
            expect(response.status).to.equal(201);
            expect(response.body.internalMessage).to.equal("Transport Mode Deactivated Successfully");
            expect(response.body.status).to.be.true;
            expect(() => assertDisableTransportMode(response.body)).not.throw();
        })
    })


})