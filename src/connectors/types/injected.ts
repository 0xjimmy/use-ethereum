import { z } from 'zod'
import { JsonRpcRequest } from './jsonRpc.js'

export type EIP1193Events = 'connect' | 'disconnect' | 'chainChanged' | 'accountsChanged' | 'message'

export interface EIP1193Provider {
	request: (payload: JsonRpcRequest) => Promise<unknown>
	on: (eventName: EIP1193Events, listener: Function) => unknown
	removeListener: (eventName: EIP1193Events, listener: Function) => unknown
}

export const EIP6963ProviderInfo = z.object({
	uuid: z.string().uuid(),
	name: z.string(),
	icon: z.string().startsWith('data:'),
	rdns: z.string()
})

interface EIP6963ProviderInfo {
	uuid: string
	name: string
	icon: string
	rdns: string
}

export interface EIP6963ProviderDetail {
	info: EIP6963ProviderInfo
	provider: EIP1193Provider
}

// Announce Event dispatched by a Wallet
export interface EIP6963AnnounceProviderEvent extends CustomEvent {
	type: 'eip6963:announceProvider'
	detail: EIP6963ProviderDetail
}

export interface EIP6963Connector {}
