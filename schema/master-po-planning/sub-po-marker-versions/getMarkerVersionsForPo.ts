import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse, CommonSpecs } from "../../common/common";

const getMarkerVersionsForPo: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getMarkerVersionsForPo",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "array",
				items: {
					type: "object",
					properties: {
						ratioId: {
							type: "string",
						},
						ratioManualCode: {
							type: "string",
						},
						ratioPlies: {
							type: "integer",
						},
						ratioDescription: {
							type: "string",
						},
						markerVersions: {
							type: "array",
							items: CommonSpecs.markerVersion,
						},
						ratioWiseComponentGroupId: {
							type: "string",
						},
						componentGroupId: {
							type: "string",
						},
						componentGroupName: {
							type: "string",
						},
						fgColor: {
							type: "string",
						},
						rmColor: {
							type: "string",
						},
						fabricCategory: {
							type: "string",
						},
						materialItemCode: {
							type: "string",
						},
						mulFactor: {
							type: "integer",
						},
						rmDescription: {
							type: "string",
						},
						fabricType: {
							type: "string",
						},
						gsm: {
							type: "integer",
						},
					},
					required: [
						"ratioId",
						"ratioManualCode",
						"ratioPlies",
						"ratioDescription",
						"markerVersions",
						"ratioWiseComponentGroupId",
						"componentGroupId",
						"componentGroupName",
						"fgColor",
						"rmColor",
						"fabricCategory",
						"materialItemCode",
						"mulFactor",
						"rmDescription",
						"fabricType",
						"gsm",
					],
				},
			},
		},
		additionalProperties: false,
	},
	example: {},
};

const PostGetMarkerVersionsForPo201: ObjectSchema = extend(BaseResponse, getMarkerVersionsForPo);

export const PostGetMarkerVersionsForPo = versionSchemas(PostGetMarkerVersionsForPo201);
