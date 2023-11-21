import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse, CommonSpecs } from "../../common/common";

const createMarkerVersion: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "createMarkerVersion",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: CommonSpecs.markerVersion,
		},
		additionalProperties: false,
	},
	example: {},
};

const PostCreateMarkerVersion201: ObjectSchema = extend(BaseResponse, createMarkerVersion);

export const PostCreateMarkerVersion = versionSchemas(PostCreateMarkerVersion201);
