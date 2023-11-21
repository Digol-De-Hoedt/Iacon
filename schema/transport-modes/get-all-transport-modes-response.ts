import {ObjectSchema, versionSchemas, extend} from '@cypress/schema-tools'
import {BaseResponse, CommonSpecs} from "../common/common";

const TransportMode: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        type: "object",
        title: "GetAllTransportModeResponse",
        description: "The root schema comprises the entire JSON document.",
        required: [
            "data"
        ],
        properties: {
            data: {
                type: "array",
                items: CommonSpecs.transportMode
            }
        },
        additionalProperties: false
    },
    example: {
        data: [{
            createdAt: "2021-10-29T19:35:15.394Z",
            createdUser: "dev",
            isActive: false,
            transportMode: "TestH",
            transportModeId: "47f85517-3fa3-48be-a58f-f315583cc5b0",
            updatedAt: "2021-10-29T19:35:15.000Z",
            updatedUser: "dev",
            versionFlag: 1
        }]
    },
}

const TransportModeResponse100: ObjectSchema = extend(BaseResponse, TransportMode);

export const CreateTransportModeResponse = versionSchemas(TransportModeResponse100);