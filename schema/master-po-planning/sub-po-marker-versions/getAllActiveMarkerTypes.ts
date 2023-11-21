import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getAllActiveMarkerTypes: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getAllActiveMarkerTypes",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "array",
				items: {
					type: "object",
					properties: {
						markerTypeId: {
							type: "string",
						},
						markerType: {
							type: "string",
						},
						description: {
							type: "string",
						},
						isActive: {
							type: "boolean",
						},
						createdAt: {
							type: "string",
						},
						createdUser: {
							type: "string",
						},
						updatedAt: {
							type: "string",
						},
						updatedUser: {
							type: ["string", null],
						},
						versionFlag: {
							type: "integer",
						},
					},
					required: [
						"markerTypeId",
						"markerType",
						"description",
						"isActive",
						"createdAt",
						"createdUser",
						"updatedAt",
						"updatedUser",
						"versionFlag",
					],
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

const PostGetAllActiveMarkerTypes201: ObjectSchema = extend(BaseResponse, getAllActiveMarkerTypes);

export const PostGetAllActiveMarkerTypes = versionSchemas(PostGetAllActiveMarkerTypes201);
