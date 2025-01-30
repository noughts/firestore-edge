import type { Value } from "./rest-api-types";


export function takeLastComponentFromPathString(path: string) {
    const ary = path.split("/")
    return ary[ary.length - 1];
}

export function serializeObject(map: any) {
    const fields = {} as any;
    for (const [key, value] of Object.entries(map)) {
        fields[key] = serializeValue(value);
    }
    return { fields };
}

/**
 * Firestoreにデータを送信するために値をフォーマットします。
 */
export function serializeValue(value: any): any {
    if (value == null) {
        return { nullValue: null };
    }
    if (value.mapValue?.fields?.__type__?.stringValue === "__vector__") {
        return value;
    }
    if (typeof value == "boolean") {
        return { booleanValue: value };
    }
    if (typeof value == "number") {
        if (Number.isInteger(value)) {
            return { integerValue: value.toString() };
        } else {
            return { doubleValue: value.toString() };
        }
    }
    if (typeof value == "string") {
        return { stringValue: value };
    }
    if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
    }
    if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(serializeValue) } };
    }
    return { mapValue: serializeObject(value) };
}


export function deserializeObject(fields: Record<string, Value>): Record<string, any> {
    const simplifiedObject: Record<string, any> = {};
    for (const key in fields) {
        simplifiedObject[key] = deserializeValue(fields[key]);
    }
    return simplifiedObject;
}

function deserializeValue(value: Value): any {
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
        return value.arrayValue.values.map(deserializeValue);
    }
    if ("timestampValue" in value) {
        return new Date(value.timestampValue as string);
    }
    if ('mapValue' in value) {
        const res = deserializeObject(value.mapValue.fields);
        if (res.__type__ == "__vector__") {
            return res.value;
        } else {
            return res;
        }
    }
    return null; // 想定されていない値には null を返す
}