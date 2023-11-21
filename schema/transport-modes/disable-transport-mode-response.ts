import {ObjectSchema, versionSchemas, extend} from '@cypress/schema-tools'
import {BaseResponse} from "../common/common";

const DisableTransportMode: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        type: "object",
        title: "DisableTransportModeResponse",
        description: "The root schema comprises the entire JSON document.",
        required: [],
        properties: {}, // no additional properties
        additionalProperties: false
    },
    example: {},
}

const DisableTransportModeResponse100: ObjectSchema = extend(BaseResponse, DisableTransportMode)

export const DisableTransportModeResponse = versionSchemas(DisableTransportModeResponse100)