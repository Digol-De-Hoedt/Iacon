import {schemas} from "../../../../../schema";
import {assertSchema} from "@cypress/schema-tools";

xdescribe("Testing transport vendor ", () => {
  const token = Cypress.env("token");
  const authorization = `bearer ${token}`;
  let randomText = (Math.random() + 1).toString(36).substring(7);
  let code = "test" + randomText;
  let vendorId = null;
  let versionFlag = 0;
  let updatedBody = null;

  it("Get all transport vendors", () => {
    const options = {
      method: "POST",
      url: `/transport-vendor-details/getAllTransportVendors`,
      headers: {
        authorization: authorization,
      },
    };

    cy.request(options).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.internalMessage).to.equal("Get All");
      expect(response.body.status).to.be.true;
      expect(response.body.data).to.be.an("array");
    });
  });

  it("Create transport vendor", () => {
    const options = {
      method: "POST",
      url: `/transport-vendor-details/createTransportVendor`,
      headers: {
        authorization: authorization,
      },
      body: {
        vendorCode: code,
        vendorName: code + "name",
        location: "aaa",
        landLineNo: "1111111",
        phoneNo: "3333333",
        email: "sgsg@sfs.sse",
        address1: "ffffffffffff",
        address2: "fffffff",
        address3: "ffffffffffff",
        address4: "ffffffff",
        createdUser: "dev",
        updatedUser: "",
        versionFlag: 0,
      },
    };

    cy.request(options).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.internalMessage).to.equal(
        "Transport Vendor Created Successfully"
      );
      const assertCreateTransportVendorResponse = assertSchema(schemas)('CreateTransportVendorResponseExample', '1.0.0');
      expect(() => {
        assertCreateTransportVendorResponse(response.body)
      }).not.throw()
      expect(response.body.status).to.be.true;
      vendorId = response.body.data.vendorId;
    });
  });

  it("Update transport vendor", () => {
    const options = {
      method: "POST",
      url: `/transport-vendor-details/updateTransportVendor`,
      headers: {
        authorization: authorization,
      },
      body: {
        vendorCode: code,
        vendorName: code + "updated",
        location: "aaa",
        landLineNo: "1111111",
        phoneNo: "33333331",
        email: "sgsg@sfs.sse",
        address1: "ffffffffffff",
        address2: "fffffff",
        address3: "ffffffffffff",
        address4: "ffffffff",
        createdUser: "dev",
        updatedUser: "dev",
        versionFlag: versionFlag,
        vendorId: vendorId,
      },
    };

    cy.request(options).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.internalMessage).to.equal(
        "Transport Vendor Updated Successfully"
      );
      expect(response.body.status).to.be.true;
      updatedBody = response.body.data;
      versionFlag++;
    });
  });

  it("Deactivate transport vendor", () => {
    const options = {
      method: "POST",
      url: `/transport-vendor-details/deActivateTransportVendorbyVendorId`,
      headers: {
        authorization: authorization,
      },
      // body: { ...updatedBody, versionFlag },
      body: updatedBody,
    };

    cy.request(options).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.internalMessage).to.equal(
        "Transport Vendor Deactivated Successfully"
      );
      expect(response.body.errorCode).to.equal(10256)
      expect(response.body.status).to.be.true;
      expect(response.body).not.to.have.property('data')
      versionFlag++;
    });
  });

  it("Activate transport vendor", () => {
    const options = {
      method: "POST",
      url: `/transport-vendor-details/deActivateTransportVendorbyVendorId`,
      headers: {
        authorization: authorization,
      },
      body: { ...updatedBody, versionFlag },
    };

    cy.request(options).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.internalMessage).to.equal(
        "Transport Vendor Activated Successfully"
      );
      expect(response.body.errorCode).to.equal(10258)
      expect(response.body.status).to.be.true;
      expect(response.body).not.to.have.property('data')
      versionFlag++;
    });
  });
});
