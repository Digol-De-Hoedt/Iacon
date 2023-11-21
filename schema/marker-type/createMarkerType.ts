import {ObjectSchema, versionSchemas, extend} from '@cypress/schema-tools'
import {BaseResponse, CommonSpecs} from "../common/common";

const CreateMarkerType: ObjectSchema = {
    version: {
        major: 1,
        minor: 0,
        patch: 0
    },
    schema: {
        type: "object",
        title: "PostCreateMarkerTypeResponse",
        description: "The root schema comprises the entire JSON document.",
        required: [
            "data"
        ],
        properties: {
            data: CommonSpecs.marker
        },
        additionalProperties: false
    },
    example: {
        data: {
            markerTypeId: "64ffdb03-26e9-46cd-9ecd-013a7078f1eb",
            markerType: "Type 001",
            description: "Description for type 001",
            createdUser: "dev",
            updatedUser: null,
            isActive: true,
            createdAt: "2021-11-03T10:57:05.287Z",
            updatedAt: "2021-11-03T10:57:05.287Z",
            versionFlag: 1
        }
    },
}

const PostCreateMarkerTypeResponse201: ObjectSchema = extend(BaseResponse, CreateMarkerType)

export const PostCreateMarkerTypeResponse = versionSchemas(PostCreateMarkerTypeResponse201)