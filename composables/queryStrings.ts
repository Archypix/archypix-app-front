import type {PictureFilter, PictureSort, PicturesQuery} from "~/types/pictures";
import {PictureFilterType, PictureSortType} from "~/types/pictures";

export type QueryComponent = {
    invert: boolean;
    key: string;
    selector?: string | number;
    values: (string | number)[];
};
export const parse_query = (query_string: string): QueryComponent[] => {
    const pairs = splitAtNonQuotedToken(' ', query_string);
    const components: QueryComponent[] = [];

    for (const pair of pairs) {
        let [key, selector_values] = pair.split('=', 2); // Works because key can’t be quoted.
        console.log("key:", key, "selector_values:", selector_values);

        // Process invert
        let invert = false;
        if (key.startsWith('!')) {
            invert = true;
            key = key.substring(1);
        }

        if (!selector_values) {
            components.push({
                invert,
                key,
                values: [],
            });
            continue
        }

        let [selector_str, values_raw] = splitAtFirstNonQuotedToken(':', selector_values);
        // Process selector, if any
        let selector: string | number | undefined = selector_str;
        if (!values_raw) {
            values_raw = selector_str;
            selector = undefined;
        } else {
            let int_val = parseInt(selector, 10);
            if (isNaN(int_val)) selector = unquoteString(selector_str);
            else selector = int_val;
        }
        // Process values
        let values_str = splitAtNonQuotedToken(',', values_raw);
        let values = values_str.map(value => {
            let int_val = parseInt(value, 10);
            if (isNaN(int_val)) return unquoteString(value);
            else return int_val;
        });
        components.push({
            invert,
            key,
            selector,
            values,
        });

    }
    return components;
};


export const build_query = (query_components: QueryComponent[], page: number): PicturesQuery => {
    const filters: PictureFilter[] = [];
    const sorts: PictureSort[] = [];

    ///const components = convertQueryComponentToIds(query_components);

    for (const component of query_components) {
        const {invert, key, selector, values} = component;

        if (key === 'config') {

        } else if (key === 'deleted') {
            filters.push({type: PictureFilterType.Deleted, invert: values[0] === 'false' || invert});
        } else if (key === 'owned') {
            filters.push({type: PictureFilterType.Owned, invert: values[0] === 'false' || invert});
        } else if (key === 'sort') {
            const sort: PictureSort = {type: PictureSortType.CreationDate, ascend: true};
            if (selector === 'creation' || (!selector && values[0] === 'creation')) {
                sort.type = PictureSortType.CreationDate;
                sort.ascend = values[0] === 'asc' || invert;
            } else if (selector === 'edition' || (!selector && values[0] === 'edition')) {
                sort.type = PictureSortType.EditionDate;
                sort.ascend = values[0] === 'asc' || invert;
            }
            sorts.push(sort);
        } else {
            if (values.some(id => isString(id))) {
                console.warn("Invalid ID in query component:", component);
                continue;
            }
            const ids = values.map(id => id as number);
            if (key === 'arrangement') {
                filters.push({type: PictureFilterType.Arrangement, invert, ids});
            } else if (key === 'group') {
                filters.push({type: PictureFilterType.Group, invert, ids});
            } else if (key === 'tag_group') {
                filters.push({type: PictureFilterType.TagGroup, invert, ids});
            } else if (key === 'tag') {
                filters.push({type: PictureFilterType.Tag, invert, ids});
            }
        }
    }

    return {filters, sorts, page};
};

export const convertQueryComponentToIds = async (components: QueryComponent[]): Promise<QueryComponent[]> => {
    return Promise.all(components.map(async component => {
        let {invert, key, selector, values} = component;

        if (key === 'config') {
            if (selector && values.length > 0 && isString(values[0])) {
                switch (selector) {
                    case 'tag_group':
                        values = [await getTagGroupIdByName(values[0])];
                        break;
                }
            }
        } else if (key === 'arrangement') {
            values = await Promise.all(values.map(async arrangement => {
                return isString(arrangement) ? await getArrangementIdByName(arrangement) : arrangement;
            }));
        } else if (key === 'group') {
            selector = (selector && isString(selector) ? await getArrangementIdByName(selector) : selector);
            values = await Promise.all(values.map(async group => {
                return selector && isString(group) ? await getGroupIdByName(selector as number ?? 0, group) : group;
            }));
        } else if (key === 'tag_group') {
            values = await Promise.all(values.map(async tag_group => {
                return isString(tag_group) ? await getTagGroupIdByName(tag_group) : tag_group;
            }));
        } else if (key === 'tag') {
            selector = selector && isString(selector) ? await getTagGroupIdByName(selector) : selector;
            values = await Promise.all(values.map(async tag => {
                return selector && isString(tag) ? await getTagIdByName(selector as number ?? 0, tag) : tag;
            }));
        }
        return {invert, key, selector, values}
    }))
};

export const convertQueryComponentToNames = async (components: QueryComponent[]): Promise<QueryComponent[]> => {
    return Promise.all(components.map(async component => {
        let {invert, key, selector, values} = component

        if (key === 'config') {
            if (selector && values.length > 0 && !isString(values[0])) {
                switch (selector) {
                    case 'tag_group':
                        values = [await getTagGroupNameById(values[0])];
                        break;
                }
            }
        } else if (key === 'arrangement') {
            values = await Promise.all(values.map(async arrangement => {
                return isString(arrangement) ? arrangement : await getArrangementNameById(arrangement);
            }));
        } else if (key === 'group') {
            selector = !selector || isString(selector) ? selector : await getArrangementNameById(selector);
            values = await Promise.all(values.map(async group => {
                return isString(group) ? group : await getGroupNameById(group);
            }));
        } else if (key === 'tag_group') {
            values = await Promise.all(values.map(async tag_group => {
                return isString(tag_group) ? tag_group : await getTagGroupNameById(tag_group);
            }));
        } else if (key === 'tag') {
            selector = !selector || isString(selector) ? selector : await getTagGroupNameById(selector);
            values = await Promise.all(values.map(async tag => {
                return isString(tag) ? tag : await getTagNameById(tag);
            }));
        }
        return {invert, key, selector, values}
    }));
};

export const queryComponentsToString = (components: QueryComponent[]): string => {
    return components.map(component => {
        let {invert, key, selector, values} = component;

        let selector_str = selector != null ? `${quoteIfNeeded(selector)}:` : '';
        let values_str = values.map(value => quoteIfNeeded(value)).join(',');

        return `${invert ? '!' : ''}${key}${values_str ? '=' : ''}${selector_str}${values_str}`;
    }).join(' ');
}

// Converters from/to id/name

const getArrangementIdByName = async (name: string): Promise<number> => {
    return await useArrangementsStore().arrangementNameToId(name) || 0;
};

const getGroupIdByName = async (arrangementId: number, groupName: string): Promise<number> => {
    return await useArrangementsStore().groupNameToGroupId(arrangementId, groupName) || 0;
};

const getTagGroupIdByName = async (name: string): Promise<number> => {
    return await useTagsStore().tagGroupNameToTagGroupId(name) || 0;
};

const getTagIdByName = async (tagGroupId: number, tagName: string): Promise<number> => {
    return await useTagsStore().tagGroupIdAndTagNameToTagId(tagGroupId, tagName) || 0;
};

const getArrangementNameById = async (id: number): Promise<string> => {
    return await useArrangementsStore().arrangementIdToName(id) || '';
};

const getGroupNameById = async (id: number): Promise<string> => {
    return await useArrangementsStore().groupIdToGroupName(id) || '';
};

const getTagGroupNameById = async (id: number): Promise<string> => {
    return await useTagsStore().tagGroupIdToTagGroupName(id) || '';
};

const getTagNameById = async (id: number): Promise<string> => {
    return await useTagsStore().tagIdToTagName(id) || '';
};

// Utils

/**
 * Split the input string at each occurrence of the token. Take care of quoted strings and escaped characters.
 * @param token separator character
 * @param input string to split
 */
function splitAtNonQuotedToken(token: string, input: string): string[] {
    const result: string[] = [];
    let currentSubstring = '';
    let inQuotes = false;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '\\' && !escaped) {
            escaped = true;
            currentSubstring += char;
        } else if (char === '"' && !escaped) {
            inQuotes = !inQuotes;
            currentSubstring += char;
        } else if (char === token && !inQuotes && !escaped) {
            result.push(currentSubstring);
            currentSubstring = '';
        } else {
            currentSubstring += char;
            escaped = false;
        }
    }
    result.push(currentSubstring);
    return result;
}

/**
 * Split the input string at the first occurrence of the token. Take care of quoted strings and escaped characters.
 * @param token separator character
 * @param input string to split
 */
function splitAtFirstNonQuotedToken(token: string, input: string): string[] {
    let result: string[] = [];
    let currentSubstring = '';
    let inQuotes = false;
    let escaped = false;

    let i;
    for (i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '\\' && !escaped) {
            escaped = true;
            currentSubstring += char;
        } else if (char === '"' && !escaped) {
            inQuotes = !inQuotes;
            currentSubstring += char;
        } else if (char === token && !inQuotes && !escaped) {
            result.push(currentSubstring);
            currentSubstring = '';
            break; // Stop after the first match
        } else {
            currentSubstring += char;
            escaped = false;
        }
    }
    if (currentSubstring.length == 0) {
        result.push(input.substring(i + 1));
    } else {
        result.push(currentSubstring);
    }
    return result;
}

/**
 * Remove quotes (if first and last character) and remove escaped quotes and escaped backslashes from a string
 * @param str
 */
function unquoteString(str: string): string {
    // Step 1: Remove the first character if it is a quote
    if (str.startsWith('"')) {
        str = str.substring(1);
    }
    // Step 2: Remove the last character if it is a quote that is preceded by a 0 or an even number of backslashes
    if (str.endsWith('"')) {
        let backslashesCount = 0;
        let i = str.length - 2;
        while (i >= 0 && str[i] === '\\') {
            backslashesCount++;
            i--;
        }
        if (backslashesCount % 2 === 0) {
            str = str.substring(0, str.length - 1);
        }
    }
    // Step 3: Replace all \" with "
    str = str.replace(/\\"/g, '"');
    // Step 4: Replace all \\ with \
    str = str.replace(/\\\\/g, '\\');
    return str;
}

/**
 * Quote the string if containing spaces, comma, colon or parsable as an int, and escapes quotes and backslashes
 * @param str string to quote or number (if it is a number, it will not be quoted, but if it is a string parsable at a number, it will be quoted).
 */
function quoteIfNeeded(str: string | number): string {
    if (!isString(str)) return str.toString();
    str = str.replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"');
    if (str.includes(' ') || str.includes(',') || str.includes(':') || !isNaN(parseInt(str, 10))) {
        str = `"${str}"`;
    }
    return str;
}

export function isString(o: any): o is string {
    return typeof o == "string" || (typeof o == "object" && o.constructor === String);
}
