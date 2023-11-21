import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getFeaturesOfOperationType: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getFeaturesOfOperationType",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "object",
				properties: {
					masterPoNumber: {
						type: "string",
					},
					sewingJobFeature: {
						type: "string",
					},
					createdUser: {
						type: "string",
					},
				},
				required: ["masterPoNumber", "createdUser"],
			},
		},
		additionalProperties: false,
	},
	example: {},
};

const PostGetFeaturesOfOperationType201: ObjectSchema = extend(
	BaseResponse,
	getFeaturesOfOperationType
);

export const PostGetFeaturesOfOperationType = versionSchemas(
	PostGetFeaturesOfOperationType201
);
