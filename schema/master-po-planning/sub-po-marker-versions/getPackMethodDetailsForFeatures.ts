import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse, CommonSpecs } from "../../common/common";

const getPackMethodDetailsForFeatures: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getPackMethodDetailsForFeatures",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "array",
				items: {
					type: "object",
					properties: {},
					required: [],
				},
			},
		},
		additionalProperties: false,
	},
	example: {},
};

const PostGetPackMethodDetailsForFeatures201: ObjectSchema = extend(BaseResponse, getPackMethodDetailsForFeatures);

export const PostGetPackMethodDetailsForFeatures = versionSchemas(PostGetPackMethodDetailsForFeatures201);
