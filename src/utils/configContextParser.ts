import type { ConfigContextResponse, ConfigContextInfo } from '@/api/partDetailApi';

/**
 * 解析配置上下文响应，获取PID对应的显示值
 * @param response 配置上下文API响应
 * @param pid 零件PID
 * @returns 显示值（Marketing Name + Revision 或 SUV）
 */
export function parseConfigContextDisplayValue(response: ConfigContextResponse, pid: string): string {
	if (!response || !response.contextInfo) {
		return '-';
	}

	// 在contextInfo中查找包含该pid的上下文
	const contextInfo = response.contextInfo.find((ctx: ConfigContextInfo) => ctx.contextOf && ctx.contextOf.includes(pid));

	if (!contextInfo) {
		return '-';
	}

	// 类型A - 有descId的情况（如BYDSong）
	if (contextInfo.descId && response.description) {
		const descData = response.description[contextInfo.descId];
		if (descData && descData.results && descData.results.length > 0) {
			const result = descData.results[0];

			// 获取Marketing Name
			let marketingName = '';
			if (result.data) {
				const marketingNameItem = result.data.find((item: { path?: string; value?: string[] }) => item.path === 'Marketing Name');
				if (marketingNameItem && marketingNameItem.value && marketingNameItem.value.length > 0) {
					marketingName = marketingNameItem.value[0];
				}
			}

			// 获取Revision
			let revision = '';
			if (result.basicData) {
				const revisionItem = result.basicData.find((item: { selectable?: string; value?: string[] }) => item.selectable === 'revision');
				if (revisionItem && revisionItem.value && revisionItem.value.length > 0) {
					revision = revisionItem.value[0];
				}
			}

			// 拼接结果
			if (marketingName && revision) {
				return `${marketingName} ${revision}`;
			} else if (marketingName) {
				return marketingName;
			} else if (revision) {
				return revision;
			}
		}
	}

	// 类型B - 有content的情况（如SUV模型）
	if (contextInfo.content && contextInfo.content.results && contextInfo.content.results.length > 0) {
		const result = contextInfo.content.results[0];

		// 优先从computed.label获取
		if (result.computed && result.computed.label && result.computed.label.value && result.computed.label.value.length > 0) {
			return result.computed.label.value[0];
		}

		// 备选从data数组获取
		if (result.data) {
			const marketingNameItem = result.data.find((item: { path?: string; value?: string[] }) => item.path === 'Marketing Name');
			if (marketingNameItem && marketingNameItem.value && marketingNameItem.value.length > 0) {
				return marketingNameItem.value[0];
			}
		}
	}

	return '-';
}

/**
 * 批量解析配置上下文
 * @param response 配置上下文API响应
 * @param pidList PID列表
 * @returns PID到显示值的映射
 */
export function parseConfigContextBatch(response: ConfigContextResponse, pidList: string[]): Record<string, string> {
	const result: Record<string, string> = {};
	pidList.forEach(pid => {
		result[pid] = parseConfigContextDisplayValue(response, pid);
	});
	return result;
}
