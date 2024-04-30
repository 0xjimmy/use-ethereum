import { z } from 'zod'
import { EIP1193Provider, JsonRpcResponse, ethereumRpcMethods } from './types/index.js'
import { EthereumMethod, isEthereumMethod } from './types/ethereumRpcMethods.js'
import { EthereumAddress } from '../types/valueTypes.js'

export * from './types/index.js'

export { watchInjectedProviders } from './injected.js'

export type ProviderEventCallbacks = {
	// connectionStatus: (status: boolean) => unknown
	// chainId: (chainId: bigint) => unknown
	connectedAccounts: (accounts: z.infer<typeof EthereumAddress>[]) => unknown
	blockNumber: (block: bigint) => unknown
	// @TODO:
	// - block
	// - log
	// - event
	// - tx stuff
}
export type ProviderEvent = keyof ProviderEventCallbacks
export type Unsubscribe = () => void

export interface ProviderConnector {
	request: {
		<T extends EthereumMethod, P extends z.infer<(typeof ethereumRpcMethods)[T]['params']>, R extends z.infer<(typeof ethereumRpcMethods)[T]['response']>>(method: T, params: P): Promise<R>
		<
			T extends string,
			P extends T extends EthereumMethod ? z.infer<(typeof ethereumRpcMethods)[T]['params']> : unknown,
			R extends T extends EthereumMethod ? z.infer<(typeof ethereumRpcMethods)[T]['params']> : unknown
		>(
			method: T,
			params: P
		): Promise<R>
	}
	subscribe: <E extends keyof ProviderEventCallbacks, C extends ProviderEventCallbacks[E]>(eventName: E, callback: C) => Unsubscribe
}

export function createHttpConnector(url: string): ProviderConnector {
	const checkedUrl = z.string().url('[createHttpConnector]: Invalid URL').parse(url)

	const connector: ProviderConnector = {
		request: async (method: string, params: unknown) => {
			if (isEthereumMethod(method)) {
				const verifiedParams = ethereumRpcMethods[method].serialize.parse(params)
				const response = await fetch(checkedUrl, {
					headers: { 'Content-Type': 'application/json' },
					method: 'POST',
					body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params: verifiedParams })
				})
				const json = await response.json()
				const jsonRpcResponse = JsonRpcResponse.parse(json)
				if ('error' in jsonRpcResponse) throw jsonRpcResponse.error
				return ethereumRpcMethods[method].response.parse(jsonRpcResponse.result)
			}
			const response = await fetch(checkedUrl, {
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params })
			})
			const json = await response.json()
			const jsonRpcResponse = JsonRpcResponse.parse(json)
			if ('error' in jsonRpcResponse) throw jsonRpcResponse.error
			return jsonRpcResponse.result
		},
		subscribe: (_method, _callback) => {
			throw 'Not implemented'
		}
	}

	return connector
}

export function createEIP1193Connector(ethereum: EIP1193Provider): ProviderConnector {
	const connector: ProviderConnector = {
		request: async (method: string, params: unknown) => {
			if (isEthereumMethod(method)) {
				const verifiedParams = ethereumRpcMethods[method].serialize.parse(params)
				const response = await ethereum.request({ id: 1, jsonrpc: '2.0', method, params: verifiedParams })
				return ethereumRpcMethods[method].response.parse(response)
			} else return await ethereum.request({ id: 1, jsonrpc: '2.0', method, params })
		},
		subscribe: (_method, _callback) => {
			// switch (method) {
			// 	case 'connectedAccounts': {
			// 		const listener = (accounts: unknown) => {
			// 			const tryParseAccounts = z.array(EthereumAddress).safeParse(accounts)
			// 			if (tryParseAccounts.success && method === 'connectedAccounts') callback(tryParseAccounts.data)
			// 		}
			// 		ethereum.on('accountsChanged', listener)
			// 		return () => ethereum.removeListener('accountsChanged', listener)
			// 	}
			// 	case 'blockNumber': {
			// 		// const listener = (block: unknown) => {
			// 		// 	const tryParseBlock = ParseBigInt.safeParse(block)
			// 		// 	if (tryParseBlock.success && method === 'blockNumber') callback(tryParseBlock.data)
			// 		// }
			// 		// ethereum.on('message', listener)
			// 		// return () => ethereum.removeListener('accountsChanged', listener)
			// 	}
			// }
			throw 'Should never throw'
		}
	}
	return connector
}
