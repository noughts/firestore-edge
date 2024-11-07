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
