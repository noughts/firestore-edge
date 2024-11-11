import { Fields, FieldValue } from "./types";

export function formatMap(map: any) {
    const fields = {} as any;
    for (const [key, value] of Object.entries(map)) {
        fields[key] = formatValue(value);
    }
    return { fields };
}

function formatValue(value: any): any {
    if (value == null) {
        return { nullValue: null };
    } else if (typeof value == "boolean") {
        return { booleanValue: value };
    } else if (typeof value == "number") {
        if (Number.isInteger(value)) {
            return { integerValue: value.toString() };
        } else {
            return { doubleValue: value };
        }
    } else if (typeof value == "string") {
        return { stringValue: value };
    } else if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(formatValue) } };
    } else {
        return { mapValue: formatMap(value) };
    }
}


export function simplifyFields(fields: Fields): Record<string, any> {
    const simplifyValue = (value: FieldValue): any => {
        if ('stringValue' in value) {
            return value.stringValue;
        }
        if ('doubleValue' in value) {
            return value.doubleValue;
        }
        if ('integerValue' in value) {
            return Number(value.integerValue);
        }
        if ('booleanValue' in value) {
            return value.booleanValue;
        }
        if ('arrayValue' in value) {
            return value.arrayValue.values.map(simplifyValue);
        }
        if ('mapValue' in value) {
            return simplifyFields(value.mapValue.fields);
        }
        return null; // 想定されていない値には null を返す
    };

    const simplifiedObject: Record<string, any> = {};
    for (const key in fields) {
        simplifiedObject[key] = simplifyValue(fields[key]);
    }
    return simplifiedObject;
}