import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getFeatureValuesForSelectedFeatures: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getFeatureValuesForSelectedFeatures",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "object",
				properties: {
					schedule: {
						type: "array",
						items: {
							type: "string",
						},
					},
				},
				required: ["schedule"],
			},
		},
		additionalProperties: false,
	},
	example: {},
};

const PostGetFeatureValuesForSelectedFeatures201: ObjectSchema = extend(BaseResponse, getFeatureValuesForSelectedFeatures);

export const PostGetFeatureValuesForSelectedFeatures = versionSchemas(PostGetFeatureValuesForSelectedFeatures201);
