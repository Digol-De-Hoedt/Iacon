import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getMosFeaturesAndMasterPoHeaderDetailsForMasterPo: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getMosFeaturesAndMasterPoHeaderDetailsForMasterPo",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "object",
				properties: {
					masterPoDesc: {
						type: "string",
					},
					masterPoSeq: {
						type: "string",
					},
					moFeatures: {
						type: "array",
						items: {
							type: "object",
							properties: {
								BUYER_DIVISION: {
									type: "string",
								},
								color: {
									type: "string",
								},
								CPO: {
									type: "string",
								},
								DELIVERY_DATE: {
									type: "string",
								},
								DESTINATION: {
									type: "string",
								},
								PACKING_METHOD: {
									type: "string",
								},
								SCHEDULE: {
									type: "string",
								},
								style: {
									type: "string",
								},
								VPO: {
									type: "string",
								},
								PRODUCT_SKU: {
									type: "string",
								},
								Z_FEATURE_NAME: {
									type: "string",
								},
								Z_FEATURE_DESC: {
									type: "string",
								},
								moNumber: {
									type: "string",
								},
								CO: {
									type: "string",
								},
							},
							required: [
								"BUYER_DIVISION",
								"color",
								"CPO",
								"DELIVERY_DATE",
								"DESTINATION",
								"PACKING_METHOD",
								"SCHEDULE",
								"style",
								"VPO",
								"PRODUCT_SKU",
								"Z_FEATURE_NAME",
								"Z_FEATURE_DESC",
								"moNumber",
								"CO",
							],
						},
					},
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

const PostGetMosFeaturesAndMasterPoHeaderDetailsForMasterPo201: ObjectSchema = extend(
	BaseResponse,
	getMosFeaturesAndMasterPoHeaderDetailsForMasterPo
);

export const PostGetMosFeaturesAndMasterPoHeaderDetailsForMasterPo = versionSchemas(
	PostGetMosFeaturesAndMasterPoHeaderDetailsForMasterPo201
);
