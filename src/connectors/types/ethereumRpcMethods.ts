import { z } from 'zod'
import { EthereumAddress, ParseBigInt, ParseHexString, EthereumBlockTag } from '../../types/valueTypes.js'

const EmptyParams = z.array(z.never()).length(0)
const BlockOrTag = z.union([ParseHexString, EthereumBlockTag])

export const ethereumRpcMethods = {
	web3_clientVersion: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.string()
	},
	web3_sha3: {
		params: z.tuple([ParseHexString]),
		serialize: z.tuple([ParseHexString]),
		response: ParseHexString
	},
	net_version: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.string()
	},
	net_listening: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.boolean()
	},
	net_peerCount: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: ParseBigInt
	},
	eth_protocolVersion: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.string()
	},
	eth_syncing: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.union([
			z.boolean(),
			z.object({
				startingBlock: ParseHexString,
				currentBlock: ParseHexString,
				highestBlock: ParseHexString
			})
		])
	},
	eth_coinbase: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: EthereumAddress
	},
	eth_chainId: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: ParseBigInt
	},
	eth_mining: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.boolean()
	},
	eth_hashrate: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: ParseBigInt
	},
	eth_gasPrice: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: ParseBigInt
	},
	eth_accounts: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: z.array(EthereumAddress)
	},
	eth_blockNumber: {
		params: EmptyParams,
		serialize: EmptyParams,
		response: ParseBigInt
	},
	eth_getBalance: {
		params: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, z.union([z.bigint(), EthereumBlockTag])])),
		serialize: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, BlockOrTag])),
		response: ParseBigInt
	},
	eth_getStorageAt: {
		params: z.tuple([EthereumAddress, z.bigint()]).or(z.tuple([EthereumAddress, z.bigint(), z.union([z.bigint(), EthereumBlockTag])])),
		serialize: z.tuple([EthereumAddress, z.bigint()]).or(z.tuple([EthereumAddress, ParseHexString, BlockOrTag])),
		response: ParseHexString
	},
	eth_getTransactionCount: {
		params: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, z.union([z.bigint(), EthereumBlockTag])])),
		serialize: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, BlockOrTag])),
		response: ParseBigInt
	},
	eth_getBlockTransactionCountByHash: {
		params: z.tuple([ParseHexString.refine((bytes) => bytes.length === 66)]),
		serialize: z.tuple([ParseHexString.refine((bytes) => bytes.length === 66)]),
		response: ParseBigInt
	},
	eth_getBlockTransactionCountByNumber: {
		params: z.tuple([z.union([z.bigint(), EthereumBlockTag])]),
		serialize: z.tuple([BlockOrTag]),
		response: ParseBigInt
	},
	eth_getUncleCountByBlockHash: {
		params: z.tuple([ParseHexString.refine((bytes) => bytes.length === 66)]),
		serialize: z.tuple([ParseHexString.refine((bytes) => bytes.length === 66)]),
		response: ParseBigInt
	},
	eth_getUncleCountByBlockNumber: {
		params: z.tuple([z.union([z.bigint(), EthereumBlockTag])]),
		serialize: z.tuple([BlockOrTag]),
		response: ParseBigInt
	},
	eth_getCode: {
		params: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, z.union([z.bigint(), EthereumBlockTag])])),
		serialize: z.tuple([EthereumAddress]).or(z.tuple([EthereumAddress, BlockOrTag])),
		response: ParseHexString
	},
	eth_sign: {
		params: z.tuple([EthereumAddress, ParseHexString]),
		serialize: z.tuple([EthereumAddress, ParseHexString]),
		response: ParseHexString
	},
	eth_signTransaction: {
		params: z.tuple([z.object({ type: z.enum(['0x1', '0x2']), from: EthereumAddress, to: EthereumAddress.optional() })]),
		serialize: z.tuple([z.object({ type: z.enum(['0x1', '0x2']), from: EthereumAddress, to: EthereumAddress.optional() })]),
		response: ParseHexString
	}
} as const

export type EthereumMethod = keyof typeof ethereumRpcMethods
export type CustomMethod = string

export const isEthereumMethod = (x: string): x is EthereumMethod => x in ethereumRpcMethods
