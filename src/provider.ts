import { z } from 'zod'
import { ProviderConnector } from './connectors/index.js'
import { EthereumAddress } from './types/valueTypes.js'

export interface Provider {
	connector: ProviderConnector
	request: ProviderConnector['request']
	connect: () => Promise<void>

	// State
	blockHeight: bigint | undefined
	chainId: bigint | undefined
	connectedAddresses: EthereumAddress[]
}

export class Provider implements Provider {
	constructor(connector: ProviderConnector, chainId?: bigint, blockHeight?: bigint, connectedAddresses?: EthereumAddress[]) {
		this.connector = connector
		this.request = connector.request
		this.chainId = chainId ?? undefined
		this.blockHeight = blockHeight ?? undefined
		this.connectedAddresses = connectedAddresses ?? []
	}

	connect = async () => {
		this.connectedAddresses = z.array(EthereumAddress).parse(await this.request('eth_requestAccounts', []))
		if (this.connectedAddresses.length > 0 && !this.chainId) {
			const [chainId, blockHeight] = await Promise.all([this.request('eth_chainId', []), this.request('eth_blockNumber', [])])
			this.chainId = chainId
			this.blockHeight = blockHeight
		}
	}
}

export async function createProvider(connector: ProviderConnector): Promise<Provider> {
	try {
		const [chainId, blockHeight, connectedAddresses] = await Promise.all([connector.request('eth_chainId', []), connector.request('eth_blockNumber', []), connector.request('eth_accounts', [])])
		return new Provider(connector, chainId, blockHeight, connectedAddresses)
	} catch (error) {
		console.warn('Connector is not connected:', error)
		return new Provider(connector)
	}
}
