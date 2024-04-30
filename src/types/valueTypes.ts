import { z } from 'zod'

export const ParseBigInt = z.preprocess((data, ctx) => {
	if (typeof data === 'bigint') return data
	if (typeof data === 'string') {
		const toHexString = ParseHexString.safeParse(data)
		if (toHexString.success) return BigInt(toHexString.data)
	}
	if (data instanceof Uint8Array) return BigInt(`0x${Array.from(data, (byte) => byte.toString(16).padStart(2, '0')).join('')}`)

	ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: 'Value is not hexstring, bigint or Uint8Array'
	})
	return z.NEVER
}, z.bigint())

export type ParseBigInt = z.infer<typeof ParseBigInt>

export const ParseHexString = z
	.preprocess((data, ctx) => {
		if (typeof data === 'bigint') return `0x${data.toString(16)}`
		if (typeof data === 'string') return data.toLowerCase()
		if (data instanceof Uint8Array) return `0x${Array.from(data, (byte) => byte.toString(16).padStart(2, '0')).join('')}`

		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Value is not string, bigint or Uint8Array'
		})
		return z.NEVER
	}, z.string())
	.refine((value): value is `0x${string}` => String(value).startsWith('0x') && value.length >= 3 && /^[0-9a-fA-F]+$/.test(value.slice(2)))

export type ParseHexString = z.infer<typeof ParseHexString>

export const EthereumAddress = ParseHexString.refine((bytes) => bytes.length === 42)
export type EthereumAddress = z.infer<typeof EthereumAddress>

export const EthereumBlockTag = z.enum(['earliest', 'latest', 'safe', 'finalized', 'pending'])
export type EthereumBlockTag = z.infer<typeof EthereumBlockTag>
