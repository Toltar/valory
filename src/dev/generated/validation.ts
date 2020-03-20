
////////////////////////////////////////////////////////
// ___   ___    _  _  ___ _____   ___ ___ ___ _____   //
// |   \ / _ \  | \| |/ _ \_   _| | __|   \_ _|_   _| //
// | |) | (_) | | .` | (_) || |   | _|| |) | |  | |   //
// |___/ \___/  |_|\_|\___/ |_|   |___|___/___| |_|   //
//                                                    //
// This file was generated by valory and should not   //
// be directly edited.                                //
////////////////////////////////////////////////////////


    // @ts-nocheck
    /* tslint:disable */
    'use strict';module.exports={validators:{"/":{POST:{202:function(){function g(b,f){var a=null,e=0;if(b&&"object"===typeof b&&!Array.isArray(b)){for(var c in b);void 0===b.body?(b={keyword:"required",dataPath:(f||"")+"",schemaPath:"#/required",params:{missingProperty:"body"},message:"should have required property 'body'"},null===a?a=[b]:a.push(b),e++):null!==b.body&&(b={keyword:"type",dataPath:(f||"")+".body",schemaPath:"#/properties/body/type",params:{type:"null"},message:"should be null"},null===
a?a=[b]:a.push(b),e++)}g.errors=a;return 0===e}g.a={required:["body"],properties:{body:{type:"null",$schema:"http://json-schema.org/draft-04/schema#"}}};return g}(),313:function(){function g(b,f){var a=null,e=0;if(b&&"object"===typeof b&&!Array.isArray(b)){for(var c in b);void 0===b.body?(b={keyword:"required",dataPath:(f||"")+"",schemaPath:"#/required",params:{missingProperty:"body"},message:"should have required property 'body'"},null===a?a=[b]:a.push(b),e++):null!==b.body&&(b={keyword:"type",dataPath:(f||
"")+".body",schemaPath:"#/properties/body/type",params:{type:"null"},message:"should be null"},null===a?a=[b]:a.push(b),e++)}g.errors=a;return 0===e}g.a={required:["body"],properties:{body:{type:"null",$schema:"http://json-schema.org/draft-04/schema#"}}};return g}(),"-1":function(){function g(b,f){var a=null,e=0;if(b&&"object"===typeof b&&!Array.isArray(b)){for(var c in b);c=b.headers;if(void 0===c){var d={keyword:"required",dataPath:(f||"")+"",schemaPath:"#/required",params:{missingProperty:"headers"},
message:"should have required property 'headers'"};null===a?a=[d]:a.push(d);e++}else if(c&&"object"===typeof c&&!Array.isArray(c)){for(d in c);c=c["cool-header"];if(void 0===c)d={keyword:"required",dataPath:(f||"")+".headers",schemaPath:"#/properties/headers/required",params:{missingProperty:"cool-header"},message:"should have required property 'cool-header'"},null===a?a=[d]:a.push(d),e++;else{if("number"!==typeof c||c%1||c!==c)d={keyword:"type",dataPath:(f||"")+".headers['cool-header']",schemaPath:"#/properties/headers/properties/cool-header/type",
params:{type:"integer"},message:"should be integer"},null===a?a=[d]:a.push(d),e++;if("number"===typeof c){if(2147483647<c||c!==c)d={keyword:"maximum",dataPath:(f||"")+".headers['cool-header']",schemaPath:"#/properties/headers/properties/cool-header/maximum",params:{comparison:"<=",limit:2147483647,exclusive:!1},message:"should be <= 2147483647"},null===a?a=[d]:a.push(d),e++;if(-2147483648>c||c!==c)d={keyword:"minimum",dataPath:(f||"")+".headers['cool-header']",schemaPath:"#/properties/headers/properties/cool-header/minimum",
params:{comparison:">=",limit:-2147483648,exclusive:!1},message:"should be >= -2147483648"},null===a?a=[d]:a.push(d),e++}}}c=b.body;if(void 0===c)d={keyword:"required",dataPath:(f||"")+"",schemaPath:"#/required",params:{missingProperty:"body"},message:"should have required property 'body'"},null===a?a=[d]:a.push(d),e++;else if(!c||"object"!==typeof c||Array.isArray(c))d={keyword:"type",dataPath:(f||"")+".body",schemaPath:"#/properties/body/type",params:{type:"object"},message:"should be object"},
null===a?a=[d]:a.push(d),e++}g.errors=a;return 0===e}g.a={required:["body","headers"],properties:{headers:{required:["cool-header"],properties:{"cool-header":{type:"integer",format:"int32",minimum:-2147483648,maximum:2147483647,$schema:"http://json-schema.org/draft-04/schema#"}}},body:{description:"Construct a type with the properties of T except for those in type K.",type:"object",$schema:"http://json-schema.org/draft-04/schema#"}}};return g}()}}},compswagVersion:2,specHash:"57cb77b3d11f4c9230a6c56e2406591feac09729"};

    