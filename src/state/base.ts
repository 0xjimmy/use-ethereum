import { ProviderConnector } from '../index.js'
import { EthereumAddress } from '../types/valueTypes.js'

interface Signal<T> {
	subscribe(fn: (value: T) => void): () => void
	valueOf(): T
	toString(): string
	toJSON(): T
	peek(): T
	get value(): T
	set value(value: T)
}

export function createWatcherWithStateManager(_storeType: 'signal', store: <T>(value: T) => Signal<T>, provider?: ProviderConnector) {
	const providerStore = store<ProviderConnector | undefined>(provider)
	const useWalletAddresses = store<EthereumAddress[]>([])
	// const useBlockNumber = store<bigint | undefined>(undefined)

	let subscriptions: (() => void)[] = []

	providerStore.subscribe((provider) => {
		subscriptions.forEach((x) => x())
		if (provider) {
			// useWalletAddresses
			provider
				.request('eth_accounts', [])
				.then((accounts) => (useWalletAddresses.value = accounts))
				.catch(() => (useWalletAddresses.value = []))
			const accountsUnsub = provider.subscribe('connectedAccounts', (accounts) => (useWalletAddresses.value = accounts))
			subscriptions.push(() => {
				accountsUnsub()
				useWalletAddresses.value = []
			})

			// useBlockNumber
			// provider
			// 	.request('eth_blockNumber', [])
			// 	.then((block) => (useBlockNumber.value = block))
			// 	.catch(() => (useWalletAddresses.value = []))
			// const blockUnsub = provider.subscribe('blockNumber', (accounts) => (useWalletAddresses.value = accounts))
			// subscriptions.push(() => {
			// 	blockUnsub()
			// 	useBlockNumber.value = undefined
			// })
		}
	})

	return { provider: providerStore, useWalletAddresses }
}
