import {ObjectSchema, versionSchemas} from "@cypress/schema-tools";

type CreateTransportVendorEntity = {
    address1: string,
    address2: string,
    address3: string,
    address4: string,
    createdAt: string,
    createdUser: string,
    email: string,
    isActive: boolean
    landLineNo: string,
    location: string,
    phoneNo: string,
    updatedAt: string,
    updatedUser: string | null,
    vendorCode: string,
    vendorId: string,
    vendorName: string,
    versionFlag: number,
}

type CreateTransportVendorResponse = {
    status: boolean,
    errorCode: number,
    internalMessage: string,
    data: CreateTransportVendorEntity
}

const createTransportVendorResponseExample: CreateTransportVendorResponse = {
    status: true,
    internalMessage: "Transport Vendor Created Successfully",
    errorCode: 10250,
    data: {
        address1: "address1",
        address2: "address2",
        address3: "address3",
        address4: "address4",
        createdAt: "2021-11-02T12:06:48.711Z",
        createdUser: "dev",
        email: "test@test.com",
        isActive: true,
        landLineNo: "01111111111",
        location: "location",
        phoneNo: "0222222222",
        updatedAt: "2021-11-02T12:06:48.711Z",
        updatedUser: null,
        vendorCode: "testcode",
        vendorId: "759f7f1b-8958-4d65-b879-632534358af8",
        vendorName: "testVendor",
        versionFlag: 0
    }
}

const createTransportVendorResponseSchema: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        title: "CreateTransportVendorResponseExample",
        type: "object",
        properties: {
            status: {
                type: "boolean"
            },
            errorCode: {
                type: "integer"
            },
            internalMessage: {
                type: "string"
            },
            data: {
                type: "object",
                properties: {
                    address1: {
                        type: "string"
                    },
                    address2: {
                        type: "string"
                    },
                    address3: {
                        type: "string"
                    },
                    address4: {
                        type: "string"
                    },
                    createdAt: {
                        type: "string"
                    },
                    createdUser: {
                        type: "string"
                    },
                    email: {
                        type: "string"
                    },
                    isActive: {
                        type: "boolean"
                    },
                    landLineNo: {
                        type: "string"
                    },
                    location: {
                        type: "string"
                    },
                    phoneNo: {
                        type: "string"
                    },
                    updatedAt: {
                        type: "string"
                    },
                    updatedUser: {
                        type: ["string", "null"]
                    },
                    vendorCode: {
                        type: "string"
                    },
                    vendorId: {
                        type: "string"
                    },
                    vendorName: {
                        type: "string"
                    },
                    versionFlag: {
                        type: "integer"
                    }
                },
                required: [
                    "address1",
                    "address2",
                    "address3",
                    "address4",
                    "createdAt",
                    "createdUser",
                    "email",
                    "isActive",
                    "landLineNo",
                    "location",
                    "phoneNo",
                    "updatedAt",
                    "updatedUser",
                    "vendorCode",
                    "vendorId",
                    "vendorName",
                    "versionFlag"
                ]
            },
        },
        required: [
            "status",
            "errorCode",
            "internalMessage",
            "data"
        ],
        additionalProperties: false,
    },
    example: createTransportVendorResponseExample,

}

export const CreateTransportVendorTypeResponse = versionSchemas(createTransportVendorResponseSchema)