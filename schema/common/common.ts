import {JsonProperties, ObjectSchema} from "@cypress/schema-tools";

const BaseResponse: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        type: "object",
        title: "BaseResponseSchema",
        description: "The root schema comprises the entire JSON document.",
        required: [
            "status",
            "errorCode",
            "internalMessage",
        ],
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
        },
        additionalProperties: false
    },
    example: {
        status: true,
        errorCode: 10151,
        internalMessage: "Marker Type Created Successfully"
    },
}

const CommonSpecs:JsonProperties = {
    marker: {
        type: "object",
        required: [
            "markerTypeId",
            "markerType",
            "description",
            "isActive",
            "createdAt",
            "createdUser",
            "updatedAt",
            "updatedUser",
            "versionFlag"
        ],
        properties: {
            markerTypeId: {
                type: "string"
            },
            markerType: {
                type: "string"
            },
            description: {
                type: "string"
            },
            isActive: {
                type: "boolean"
            },
            createdAt: {
                type: "string"
            },
            createdUser: {
                type: "string"
            },
            updatedAt: {
                type: "string"
            },
            updatedUser: {
                type: ["string", "null"]
            },
            versionFlag: {
                type: "integer"
            }
        },
        additionalProperties: false
    },
    markerVersion:{
        type: "object",
        properties: {
            markerVersionId: {
                type: "string",
            },
            length: {
                type: "string",
            },
            width: {
                type: "string",
            },
            markerVersion: {
                type: "string",
            },
            markerTypeId: {
                type: "string",
            },
            patternVersion: {
                type: "string",
            },
            perimeter: {
                type: "string",
            },
            remark1: {
                type: "string",
            },
            remark2: {
                type: ["string", "null"],
            },
            remark3: {
                type: ["string", "null"],
            },
            remark4: {
                type: ["string", "null"],
            },
            shrinkage: {
                type: "string",
            },
            efficiency: {
                type: "string",
            },
            isActive: {
                type: "boolean",
            },
            plantCode: {
                type: "string",
            },
            updatedUser: {
                type: ["string", "null"],
            },
            createdUser: {
                type: "string",
            },
            createdAt: {
                type: "string",
            },
            updatedAt: {
                type: "string",
            },
            versionFlag: {
                type: "integer",
            },
            markerTypeName: {
                type: "string",
            },
            ratioWiseComponentGroupId: {
                type: "string",
            },
            defaultMarkerVersion: {
                type: "boolean",
            },
            endAllowance: {
                type: "string",
            },
            poNumber: {
                type: "string",
            },
        },
        required: [
            "markerVersionId",
            "length",
            "width",
            "markerVersion",
            "markerTypeId",
            "patternVersion",
            "perimeter",
            "remark1",
            "remark2",
            "remark3",
            "remark4",
            "shrinkage",
            "efficiency",
            "isActive",
            "plantCode",
            "updatedUser",
            "createdUser",
            "createdAt",
            "updatedAt",
            "versionFlag",
            "markerTypeName",
            "ratioWiseComponentGroupId",
            "defaultMarkerVersion",
            "endAllowance",
            "poNumber",
        ],
    },
    transportMode: {
        type: "object",
        properties: {
            createdAt: {
                type: "string"
            },
            createdUser: {
                type: "string"
            },
            isActive: {
                type: "boolean"
            },
            transportMode: {
                type: "string"
            },
            transportModeId: {
                type: "string"
            },
            updatedAt: {
                type: "string"
            },
            updatedUser: {
                type: ["string", "null"]
            },
            versionFlag: {
                type: "integer"
            }
        },
        required: [
            "createdAt",
            "createdUser",
            "isActive",
            "transportMode",
            "transportModeId",
            "updatedAt",
            "updatedUser",
            "versionFlag"
        ],
        additionalProperties: false,
    }
}

export {BaseResponse, CommonSpecs}