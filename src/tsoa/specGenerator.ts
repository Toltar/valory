import {Tsoa} from "./metadataGeneration/tsoa";
import {normalisePath} from "./utils/pathUtils";
import {Swagger} from "../server/swagger";
import {merge} from "lodash";
import ReferenceAlias = Tsoa.ReferenceAlias;

export class SpecGenerator {
	constructor(private readonly metadata: Tsoa.Metadata) {
	}

	public GetSpec() {
		const spec: Swagger.Spec = {
			// basePath: normalisePath(this.config.basePath as string, "/"),
			consumes: ["application/json"],
			definitions: this.buildDefinitions(),
			info: {
				title: "",
			},
			paths: this.buildPaths(),
			produces: ["application/json"],
			swagger: "2.0",
		};

		return spec;
	}

	private buildDefinitions() {
		const definitions: { [definitionsName: string]: Swagger.Schema } = {};
		Object.keys(this.metadata.referenceTypeMap).map((typeName) => {
			const referenceType = this.metadata.referenceTypeMap[typeName];

			if (referenceType.dataType === "refObject" || referenceType.dataType === "refEnum") {
				// Object definition
				if (referenceType.properties) {
					const required = referenceType.properties.filter((p) => p.required).map((p) => p.name);
					definitions[referenceType.refName] = {
						description: referenceType.description,
						properties: this.buildProperties(referenceType.properties),
						required: required && required.length > 0 ? Array.from(new Set(required)) : undefined,
						type: "object",
					};

					if (referenceType.additionalProperties) {
						definitions[referenceType.refName].additionalProperties =
							this.buildAdditionalProperties(referenceType.additionalProperties);
					}
				}

				if (referenceType.example) {
					definitions[referenceType.refName].example = referenceType.example;
				}

				// Enum definition
				if (referenceType.enums) {
					definitions[referenceType.refName] = {
						description: referenceType.description,
						enum: referenceType.enums,
						type: "string",
					};
				}

				// Actual type info overrides swagger tag
				if (referenceType.additionalSwagger) {
					definitions[referenceType.refName] = merge(definitions[referenceType.refName], referenceType.additionalSwagger);
				}
			}

			if (referenceType.dataType === "refAlias") {
				const swaggerType = this.getSwaggerType(referenceType.type);
				const format = referenceType.format as Swagger.DataFormat;
				swaggerType.description = referenceType.description;
				swaggerType.format = format || swaggerType.format;
				swaggerType.example = referenceType.example;
				if (!swaggerType.$ref) {
					Object.keys(referenceType.validators)
						.filter((key) => {
							return !key.startsWith("is") && key !== "minDate" && key !== "maxDate";
						})
						.forEach((key) => {
							(swaggerType as any)[key] = referenceType.validators[key].value;
						});
				}

				definitions[referenceType.refName] = swaggerType;
			}

		});

		return definitions;
	}

	private buildPaths() {
		const paths: { [pathName: string]: Swagger.Path } = {};

		this.metadata.controllers.forEach((controller) => {
			const normalisedControllerPath = normalisePath(controller.path, "/");
			controller.methods.forEach((method) => {
				const normalisedMethodPath = normalisePath(method.path, "/");
				const path = normalisePath(`${normalisedControllerPath}${normalisedMethodPath}`, "/", "", false);
				paths[path] = paths[path] || {};
				this.buildMethod(controller.name, method, paths[path]);
			});
		});

		return paths;
	}

	private buildMethod(controllerName: string, method: Tsoa.Method, pathObject: any) {
		const pathMethod: Swagger.Operation = pathObject[method.method] = this.buildOperation(controllerName, method);
		pathMethod.description = method.description;
		pathMethod.summary = method.summary;
		pathMethod.tags = method.tags;

		if (method.deprecated) {
			pathMethod.deprecated = method.deprecated;
		}
		if (method.security) {

			const methodSecurity: any[] = [];
			for (const thisSecurity of method.security) {
				const security: any = {};
				security[thisSecurity.name] = thisSecurity.scopes ? thisSecurity.scopes : [];
				methodSecurity.push(security);
			}

			pathMethod.security = methodSecurity;
		}

		pathMethod.parameters = method.parameters
			.filter((p) => {
				return !(p.in === "request" || p.in === "body-prop" || p.in === "logger");
			})
			.map((p) => this.buildParameter(p));

		const bodyPropParameter = this.buildBodyPropParameter(controllerName, method);
		if (bodyPropParameter) {
			pathMethod.parameters.push(bodyPropParameter);
		}
		if ((pathMethod.parameters.filter as any)((p: Swagger.BaseParameter) => p.in === "body").length > 1) {
			throw new Error("Only one body parameter allowed per controller method.");
		}
	}

	private buildBodyPropParameter(controllerName: string, method: Tsoa.Method) {
		const properties = {} as { [name: string]: Swagger.Schema };
		const required: string[] = [];

		method.parameters
			.filter((p) => p.in === "body-prop")
			.forEach((p) => {
				properties[p.name] = this.getSwaggerType(p.type);
				properties[p.name].default = p.default;
				properties[p.name].description = p.description;

				if (p.required) {
					required.push(p.name);
				}
			});

		if (!Object.keys(properties).length) {
			return;
		}

		const parameter = {
			in: "body",
			name: "body",
			schema: {
				properties,
				title: `${this.getOperationId(method.name)}Body`,
				type: "object",
			},
		} as Swagger.BodyParameter;
		if (required.length) {
			parameter.schema.required = required;
		}
		return parameter;
	}

	private buildParameter(source: Tsoa.Parameter): Swagger.Parameter {
		let parameter = {
			default: source.default,
			description: source.description,
			in: source.in,
			name: source.name,
			required: source.required,
		} as Swagger.Parameter;

		const parameterType = this.getSwaggerType(source.type);
		parameter.format = parameterType.format || undefined;

		if (parameter.in === "query" && parameter.type === "array") {
			(parameter as Swagger.QueryParameter).collectionFormat = "multi";
		}

		if (parameterType.$ref) {
			(parameter as Swagger.BodyParameter).schema = parameterType as Swagger.Schema;
			return parameter;
		}

		const validatorObjs = {};
		Object.keys(source.validators)
			.filter((key) => {
				return !key.startsWith("is") && key !== "minDate" && key !== "maxDate";
			})
			.forEach((key: string) => {
				(validatorObjs as any)[key] = source.validators[key].value;
			});

		if (source.in === "body" && source.type.dataType === "array") {
			(parameter as Swagger.BodyParameter).schema = {
				items: parameterType.items,
				type: "array",
			};
		} else {
			if (source.type.dataType === "any") {
				if (source.in === "body") {
					(parameter as Swagger.BodyParameter).schema = {type: "object"};
				} else {
					parameter.type = "string";
				}
			} else {
				parameter.type = parameterType.type;
				parameter.items = parameterType.items;
				parameter.enum = parameterType.enum;
			}
		}

		if ((parameter as Swagger.BodyParameter).schema != null) {
			(parameter as Swagger.BodyParameter).schema =
				Object.assign({}, (parameter as Swagger.BodyParameter).schema, validatorObjs);
		} else {
			parameter = Object.assign({}, parameter, validatorObjs);
		}

		return parameter;
	}

	private buildProperties(source: Tsoa.Property[]) {
		const properties: { [propertyName: string]: Swagger.Schema } = {};

		source.forEach((property) => {
			const swaggerType = this.getSwaggerType(property.type);
			const format = property.format as Swagger.DataFormat;
			swaggerType.description = property.description;
			swaggerType.format = format || swaggerType.format;
			if (!swaggerType.$ref) {
				swaggerType.default = property.default;

				Object.keys(property.validators)
					.filter((key) => {
						return !key.startsWith("is") && key !== "minDate" && key !== "maxDate";
					})
					.forEach((key) => {
						(swaggerType as any)[key] = property.validators[key].value;
					});
			}

			// if (!property.required)  {
			//   (swaggerType as any)["x-nullable"] = true;
			// }

			properties[property.name] = swaggerType as Swagger.Schema;
		});

		return properties;
	}

	private buildAdditionalProperties(type: Tsoa.Type) {
		return this.getSwaggerType(type);
	}

	private buildOperation(controllerName: string, method: Tsoa.Method): Swagger.Operation {
		const swaggerResponses: any = {};

		method.responses.forEach((res: Tsoa.Response) => {
			swaggerResponses[res.name] = {
				description: res.description,
			};
			if (res.schema && res.schema.dataType !== "void") {
				swaggerResponses[res.name].schema = this.getSwaggerType(res.schema);
			}
			if (res.examples) {
				swaggerResponses[res.name].examples = {"application/json": res.examples};
			}
		});

		return {
			operationId: this.getOperationId(method.name),
			produces: ["application/json"],
			responses: swaggerResponses,
		};
	}

	private getOperationId(methodName: string) {
		return methodName.charAt(0).toUpperCase() + methodName.substr(1);
	}

	private getSwaggerType(type: Tsoa.Type): Swagger.Schema {
		const swaggerType = this.getSwaggerTypeForPrimitiveType(type);
		if (swaggerType) {
			return swaggerType;
		}

		if (type.dataType === "array") {
			return this.getSwaggerTypeForArrayType(type as Tsoa.ArrayType);
		}

		if (type.dataType === "enum") {
			return this.getSwaggerTypeForEnumType(type as Tsoa.EnumerateType);
		}

		return this.getSwaggerTypeForReferenceType(type as Tsoa.ReferenceType) as Swagger.Schema;
	}

	private getSwaggerTypeForPrimitiveType(type: Tsoa.Type): Swagger.Schema | undefined {
		const map = {
			any: {type: "object"},
			binary: {type: "string", format: "binary"},
			boolean: {type: "boolean"},
			buffer: {type: "string", format: "byte"},
			byte: {type: "string", format: "byte"},
			date: {type: "string", format: "date"},
			datetime: {type: "string", format: "date-time"},
			double: {type: "number", format: "double"},
			float: {type: "number", format: "float"},
			integer: {type: "integer", format: "int32"},
			long: {type: "integer", format: "int64"},
			object: {type: "object"},
			string: {type: "string"},
		} as { [name: string]: Swagger.Schema };

		return map[type.dataType];
	}

	private getSwaggerTypeForArrayType(arrayType: Tsoa.ArrayType): Swagger.Schema {
		return {type: "array", items: this.getSwaggerType(arrayType.elementType)};
	}

	private getSwaggerTypeForEnumType(enumType: Tsoa.EnumerateType): Swagger.Schema {
		return {type: "string", enum: enumType.enums.map((member) => String(member))};
	}

	private getSwaggerTypeForReferenceType(referenceType: Tsoa.ReferenceType): Swagger.BaseSchema {
		return {$ref: `#/definitions/${referenceType.refName}`};
	}
}
