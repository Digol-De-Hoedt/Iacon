import { ObjectSchema, versionSchemas, extend } from "@cypress/schema-tools";
import { BaseResponse } from "../../common/common";

const getMpPackListSummary: ObjectSchema = {
	version: {
		major: 1,
		minor: 0,
		patch: 0,
	},
	schema: {
		type: "object",
		title: "getMpPackListSummary",
		description: "The root schema comprises the entire JSON document.",
		required: ["data"],
		properties: {
			data: {
				type: "object",
				properties: {
					packingListOriginalQty: {
						type: "object",
						properties: {
							ORIGINAL_QUANTITY: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
							EXTRA_SHIPMENT: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
							CARTON_GENERATED_QTY: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
							PACKING_METHOD_QTY: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
							VARIANCE_ORDER_QTY: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
							PACKING_METHOD_VARIANCE: {
								type: "array",
								items: {
									type: "object",
									properties: {
										size: {
											type: "string",
										},
										color: {
											type: "string",
										},
										schedule: {
											type: "string",
										},
										quantity: {
											type: "integer",
										},
									},
									required: ["size", "color", "quantity"],
								},
							},
						},
						required: [
							"ORIGINAL_QUANTITY",
							"CARTON_GENERATED_QTY",
							"PACKING_METHOD_QTY",
							"VARIANCE_ORDER_QTY",
							"PACKING_METHOD_VARIANCE",
						],
					},
					templateQtyFulfilled: {
						type: "boolean",
					},
				},
				required: ["packingListOriginalQty", "templateQtyFulfilled"],
			},
		},
		additionalProperties: false,
	},
	example: {},
};

const PostGetMpPackListSummary201: ObjectSchema = extend(BaseResponse, getMpPackListSummary);

export const PostGetMpPackListSummary = versionSchemas(PostGetMpPackListSummary201);
