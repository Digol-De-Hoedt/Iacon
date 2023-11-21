import {ObjectSchema, versionSchemas, extend} from '@cypress/schema-tools'
import {BaseResponse} from "../common/common";

const DeActivateMarkerType: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        type: "object",
        title: "PostDeActivateMarkerTypeResponse",
        description: "The root schema comprises the entire JSON document.",
        required: [],
        properties: {}, // no additional properties
        additionalProperties: false
    },
    example: {},
}

const PostDeActivateMarkerTypeResponse201: ObjectSchema = extend(BaseResponse, DeActivateMarkerType)

export const PostDeActivateMarkerTypeResponse = versionSchemas(PostDeActivateMarkerTypeResponse201)