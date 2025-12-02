import { getJSON, postJSON, deleteJSON, appendProjectDir } from "./apiClient"
import type { DataRecord, AnalysesRecord } from "../types/appData"

export async function fetchAnalyses(
    apiPrefix: string
): Promise<AnalysesRecord> {
    const url = appendProjectDir(`${apiPrefix}/analyses`)
    return getJSON<AnalysesRecord>(url)
}

export async function fetchData(apiPrefix: string): Promise<DataRecord> {
    const url = appendProjectDir(`${apiPrefix}/data`)
    return getJSON<DataRecord>(url)
}

export async function createAnalysis(
    apiPrefix: string,
    type: string,
    values: unknown
): Promise<void> {
    const url = appendProjectDir(`${apiPrefix}/analyses`)
    await postJSON(url, { type, data: values })
}

export async function saveDataEntry(
    apiPrefix: string,
    category: string,
    payload: unknown
): Promise<void> {
    const url = appendProjectDir(`${apiPrefix}/data`)
    await postJSON(url, { type: category, data: payload })
}

export async function saveDuplicateEntry(
    apiPrefix: string,
    section: "data" | "analyses",
    type: string,
    payload: unknown
): Promise<void> {
    const base = section === "data" ? "data" : "analyses"
    const url = appendProjectDir(`${apiPrefix}/${base}`)
    await postJSON(url, { type, data: payload })
}

export async function deleteDataItem(
    apiPrefix: string,
    type: string,
    index: number,
    name?: string | null
) {
    const base = `${apiPrefix}/data/${encodeURIComponent(type)}/${index}`;
    const url = appendProjectDir(base);
    const body = name ? { name } : undefined;
    return deleteJSON<{ success: boolean; deletedName?: string }>(url, body);
}

export async function deleteAnalysisItem(
    apiPrefix: string,
    type: string,
    index: number,
    name?: string | null
) {
    const base = `${apiPrefix}/analyses/${encodeURIComponent(type)}/${index}`;
    const url = appendProjectDir(base);
    const body = name ? { name } : undefined;
    return deleteJSON<{ success: boolean; deletedName?: string }>(url, body);
}

export async function renameAnalysisOnServer(
    apiPrefix: string,
    folder: string,
    originalItem: any,
    newName: string
): Promise<void> {
    const signature = JSON.stringify(originalItem)
    const copy = { ...originalItem, name: newName }

    await postJSON(appendProjectDir(`${apiPrefix}/analyses`), {
        type: folder,
        data: copy,
    })

    const refreshed = await getJSON<AnalysesRecord>(
        appendProjectDir(`${apiPrefix}/analyses`)
    )
    const refreshedList = Array.isArray(refreshed[folder])
        ? refreshed[folder]
        : []

    let deleteIndex = refreshedList.findIndex(
        item => JSON.stringify(item) === signature
    )
    if (deleteIndex < 0) {
        deleteIndex = refreshedList.findIndex(
            item => item.name === originalItem.name
        )
    }

    if (deleteIndex >= 0) {
        await deleteJSON(
            appendProjectDir(
                `${apiPrefix}/analyses/${encodeURIComponent(folder)}/${deleteIndex}`
            )
        )
    }
}

export async function renameDataOnServer(
    apiPrefix: string,
    param: string,
    originalItem: any,
    newName: string
): Promise<void> {
    const signature = JSON.stringify(originalItem)
    const copy = { ...originalItem, name: newName }

    await postJSON(appendProjectDir(`${apiPrefix}/data`), {
        type: param,
        data: copy,
    })

    const refreshed = await getJSON<DataRecord>(
        appendProjectDir(`${apiPrefix}/data`)
    )
    const refreshedList = Array.isArray(refreshed[param])
        ? refreshed[param]
        : []

    let deleteIndex = refreshedList.findIndex(
        item => JSON.stringify(item) === signature
    )
    if (deleteIndex < 0) {
        deleteIndex = refreshedList.findIndex(
            item => item.name === originalItem.name
        )
    }

    if (deleteIndex >= 0) {
        await deleteJSON(
            appendProjectDir(
                `${apiPrefix}/data/${encodeURIComponent(param)}/${deleteIndex}`
            )
        )
    }
}
