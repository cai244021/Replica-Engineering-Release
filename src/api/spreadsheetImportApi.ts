import { requirejsPromise } from '@widget-lab/3ddashboard-utils';
import { isDev, baseApi } from '@/utils/env';
import { useBaseInfoStore } from '@/store';

export interface SpreadsheetImportErrorItem {
	'RowNumber': string;
	'Column Name': string;
	'Column Value': string;
	'Error Description': string;
}

export interface SpreadsheetImportResponse {
	MappedSpreadSheetColumns?: Record<string, string>;
	ImportDataSeparator?: string;
	ObjectBasics?: Record<string, string>;
	TypeAttributes?: Record<string, string>;
	RelationshipAttributes?: Record<string, string>;
	MandColumns?: Record<string, string>;
	Action?: 'Error' | 'Success' | string;
	ReportedErrors?: SpreadsheetImportErrorItem[];
	ErrorCount?: string;
	COUNT_ROOTITEM?: string;
	COUNT_ADDNEWREFRENCE?: string;
	COUNT_ADDEXISTINGREFERENCE?: string;
	COUNT_MODIFY?: string;
	COUNT_ADDNEWINSTANCE?: string;
	COUNT_ADDEXISTINGINSTANCE?: string;
	ROOT_PHYSICALID?: string;
}

const getSpaceBaseUrl = () => {
	const storedSpaceUrl = window.localStorage.getItem('spaceUrl');
	const fallbackUrl = window.location.href.split('/webapp')[0];
	return isDev ? baseApi : storedSpaceUrl || fallbackUrl;
};

const requestImportItem = async (file: File, operation: 'Validate' | 'Author'): Promise<SpreadsheetImportResponse> => {
	const WAFData = await requirejsPromise('DS/WAFData/WAFData');
	const baseInfoStore = useBaseInfoStore();
	if (!baseInfoStore.spaceUrl) {
		await baseInfoStore.fetchSpaceUrl();
	}
	if (!baseInfoStore.securityContext) {
		await baseInfoStore.getCollaborativeSpace();
	}
	const securityContext = baseInfoStore.securityContext ? encodeURIComponent(`ctx::${baseInfoStore.securityContext}`) : '';
	const formData = new FormData();
	formData.append('file', file);
	formData.append(
		'text',
		JSON.stringify({
			operation,
			ContextEntityPhysicalId: null,
			IgnoreColumnList: '',
			userMappedColumns: {},
			TimeoutConstraintsInMS: 300000
		})
	);

	return new Promise((resolve, reject) => {
		const requestUrl = `${getSpaceBaseUrl()}/resources/v1/engineeringItem/importitem?tenant=OnPremise&_=${Date.now()}&xrequestedwith=xmlhttprequest`;
		WAFData.authenticatedRequest(requestUrl, {
			type: 'json',
			method: 'POST',
			headers: {
				...(securityContext ? { SecurityContext: securityContext } : {})
			},
			data: formData,
			onComplete: (response: SpreadsheetImportResponse | string) => {
				if (typeof response === 'string') {
					try {
						resolve(JSON.parse(response) as SpreadsheetImportResponse);
					} catch {
						reject(response);
					}
					return;
				}
				resolve(response);
			},
			onFailure: (error: unknown) => reject(error)
		});
	});
};

export const spreadsheetImportApi = {
	validate: (file: File) => requestImportItem(file, 'Validate'),
	author: (file: File) => requestImportItem(file, 'Author')
};

export default spreadsheetImportApi;
