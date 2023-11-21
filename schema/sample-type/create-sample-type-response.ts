import {ObjectSchema, versionSchemas} from '@cypress/schema-tools';

type PostCreateSampleTypeEntity = {
    sampleTypeCode: string,
    sampleTypeDesc: string,
    createdUser: string,
    updatedUser: string,
    sampleTypeId: string,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    versionFlag: number,
}

type PostCreateSampleTypeResponseEx100 = {
    status: boolean,
    errorCode: number,
    internalMessage: string,
    data: PostCreateSampleTypeEntity
}

const postSampleTypeExample100: PostCreateSampleTypeResponseEx100 = {
    status: true,
    errorCode: 10100,
    internalMessage: "Sample Type created successfully",
    data: {
        sampleTypeCode: "test123333",
        sampleTypeDesc: "sfsf",
        createdUser: "dev",
        updatedUser: null,
        sampleTypeId: "394e61d1-9cc5-496e-919c-6ffe5cee048a",
        isActive: true,
        createdAt: "2021-11-01T15:24:17.689Z",
        updatedAt: "2021-11-01T15:24:17.689Z",
        versionFlag: 1
    }
}

const PostCreateSampleTypeResponse100: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0,
    },
    schema: {
        title: "PostCreateSampleTypeResponse",
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
                        // In sample type creation the update user is null
                        type: ["string", "null"]
                    },
                    sampleTypeId: {
                        type: "string"
                    },
                    isActive: {
                        type: "boolean"
                    },
                    createdAt: {
                        type: "string"
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
                    "createdAt",
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

export const PostCreateSampleTypeResponse = versionSchemas(PostCreateSampleTypeResponse100)
