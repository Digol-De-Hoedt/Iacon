import {SchemaCollection, bind, combineSchemas} from '@cypress/schema-tools'
import {PostCreateSampleTypeResponse} from "./sample-type/create-sample-type-response";
import {PostUpdateSampleTypeResponse} from "./sample-type/update-sample-type-response";
import * as MarkerTypeResponses from "./marker-type";
import * as TransportVendorResponses from './transport-vendor'
import * as MasterPoPlanning from "./master-po-planning";
import * as TransportModeResponses from "./transport-modes";


export const schemas: SchemaCollection = combineSchemas(
    PostCreateSampleTypeResponse,
    ...Object.values(TransportVendorResponses),
    PostUpdateSampleTypeResponse,
    ...Object.values(TransportModeResponses),
    ...Object.values(MarkerTypeResponses),
    ...Object.values(MasterPoPlanning)
)

export const api = bind({schemas, formats: null})
/*
  api has methods to validate, sanitize, etc. objects against "schemas"
  {
    assertSchema: [Function],
    schemaNames: [ 'postTodoRequest' ],
    getExample: [Function],
    sanitize: [Function],
    validate: [Function]
  }
*/
