import { ElMessage } from 'element-plus';

type MessageOptionsLike = {
	message?: unknown;
	duration?: number;
	showClose?: boolean;
	[key: string]: unknown;
};

const escapeHtml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const formatErrorMessage = (message: string) =>
	message
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/；/g, '\n')
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.map(line => `<div>${escapeHtml(line)}</div>`)
		.join('');

export const installGlobalErrorMessage = () => {
	const originalError = ElMessage.error.bind(ElMessage);
	ElMessage.error = options => {
		if (typeof options === 'string') {
			return originalError({
				message: formatErrorMessage(options),
				dangerouslyUseHTMLString: true,
				duration: 12000,
				showClose: true
			});
		}

		const messageOptions = options as MessageOptionsLike;
		if (messageOptions && typeof messageOptions === 'object' && typeof messageOptions.message === 'string') {
			return originalError({
				...messageOptions,
				message: formatErrorMessage(messageOptions.message),
				dangerouslyUseHTMLString: true,
				duration: messageOptions.duration ?? 12000,
				showClose: messageOptions.showClose ?? true
			});
		}

		return originalError(options);
	};
};
