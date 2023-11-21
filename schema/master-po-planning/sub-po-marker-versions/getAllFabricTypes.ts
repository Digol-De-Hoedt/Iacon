import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getAllFabricTypes: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getAllFabricTypes",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "array",
				items: {
					type: "object",
					properties: {
						fabricType: {
							type: "string",
						},
						gsmStartValue: {
							type: "string",
						},
						gsmEndValue: {
							type: "string",
						},
						markerStartValue: {
							type: "string",
						},
						markerEndValue: {
							type: "string",
						},
						endAllowance: {
							type: "string",
						},
					},
					required: ["fabricType", "gsmStartValue", "gsmEndValue", "markerStartValue", "markerEndValue", "endAllowance"],
				},
			},
		},
		additionalProperties: false,
	},
	example: {
		data: [
			{
				markerTypeId: "64ffdb03-26e9-46cd-9ecd-013a7078f1eb",
				markerType: "qq",
				description: "qq",
				isActive: true,
				createdAt: "2021-11-03T10:57:05.287Z",
				createdUser: "dev",
				updatedAt: "2021-11-03T10:57:05.287Z",
				updatedUser: null,
				versionFlag: 1,
			},
		],
	},
};

const PostGetAllFabricTypes201: ObjectSchema = extend(BaseResponse, getAllFabricTypes);

export const PostGetAllFabricTypes = versionSchemas(PostGetAllFabricTypes201);
