import {Constants} from "../../../../../common/constants";

xdescribe('Marker Summary', () => {
    const authorization = `Bearer ${Cypress.env("token")}`;
    const masterPoNumber = "cc556e54-b1e6-4b5c-9331-b445669a0d97";

    let subPoNumbers = [];

    it('Get Sub PO Numbers DropDown For Master PO Number', () => {
        const options = {
            method: 'POST',
            url: '/production-planning-service/production-order/getSubPoNumbersDropDownForMasterPoNumber',
            headers: {
                authorization: authorization
            },
            body: { masterPoNumber: masterPoNumber }
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.data).to.be.an('array');
            expect(response.body.internalMessage).to.equal(Constants.PPS_PO_NUMBERS_DROPDOWN_INFO_RETRIEVED_SUCCESSFULLY);

            subPoNumbers = response.body.data;
        })
    })

    it('Get MOS Features And Master PO Header Details for Master PO', () => {
        const options = {
            method: 'POST',
            url: '/production-planning-service/MasterProductionOrderController/getMosFeaturesAndMasterPoHeaderDetailsForMasterPo',
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
            body: {poNumber: subPoNumbers[0].poNumber}
        }

        cy.request(options).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.status).to.be.true;
            expect(response.body.internalMessage).to.equal(Constants.PPS_MARKERS_SUMMARY_DATA_SUCCESS);
        })
    })
})