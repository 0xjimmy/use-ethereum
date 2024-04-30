import { EIP6963AnnounceProviderEvent, EIP6963ProviderInfo } from './types/injected.js'

declare global {
	interface WindowEventMap {
		'eip6963:announceProvider': EIP6963AnnounceProviderEvent
	}
}

export function watchInjectedProviders() {
	window.addEventListener('eip6963:announceProvider', ({ detail }: EIP6963AnnounceProviderEvent) => {
		const info = EIP6963ProviderInfo.safeParse(detail.info)
		if (info.success) {
			console.log({ info: info.data, provider: detail.provider })
		}
	})
	window.dispatchEvent(new Event('eip6963:requestProvider'))
}
