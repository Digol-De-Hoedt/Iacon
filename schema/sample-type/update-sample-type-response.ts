import {ObjectSchema, versionSchemas} from '@cypress/schema-tools';

type PostUpdateSampleTypeEntity = {
    sampleTypeCode: string,
    sampleTypeDesc: string,
    createdUser: string,
    updatedUser: string,
    sampleTypeId: string,
    isActive: boolean,
    updatedAt: string,
    versionFlag: number,
}

type PostUpdateSampleTypeResponseEx100 = {
    status: boolean,
    errorCode: number,
    internalMessage: string,
    data: PostUpdateSampleTypeEntity
}

const postSampleTypeExample100: PostUpdateSampleTypeResponseEx100 = {
    status: true,
    errorCode: 10100,
    internalMessage: "Sample Type created successfully",
    data: {
        sampleTypeCode: "test123333",
        sampleTypeDesc: "sfsf",
        createdUser: "dev",
        updatedUser: "dev",
        sampleTypeId: "394e61d1-9cc5-496e-919c-6ffe5cee048a",
        isActive: true,
        updatedAt: "2021-11-01T15:24:17.689Z",
        versionFlag: 1
    }
}

const PostUpdateSampleTypeResponse100: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0,
    },
    schema: {
        title: "PostUpdateSampleTypeResponse",
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
                    sampleTypeCode: {
                        type: "string"
                    },
                    sampleTypeDesc: {
                        type: "string"
                    },
                    createdUser: {
                        type: "string"
                    },
                    updatedUser: {
                        type: ["string"]
                    },
                    sampleTypeId: {
                        type: "string"
                    },
                    isActive: {
                        type: "boolean"
                    },
                    updatedAt: {
                        type: "string"
                    },
                    versionFlag: {
                        type: "integer"
                    }
                },
                required: [
                    "sampleTypeCode",
                    "sampleTypeDesc",
                    "createdUser",
                    "updatedUser",
                    "sampleTypeId",
                    "isActive",
                    "updatedAt",
                    "versionFlag"
                ]
            }
        },
        required: [
            "status",
            "errorCode",
            "internalMessage",
            "data"
        ],
        // do not allow any extra properties
        additionalProperties: false,
    },
    example: postSampleTypeExample100,
}

export const PostUpdateSampleTypeResponse = versionSchemas(PostUpdateSampleTypeResponse100);
