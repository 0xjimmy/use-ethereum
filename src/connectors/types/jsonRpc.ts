import { z } from 'zod'

const JsonRpcRequest = z.object({
	jsonrpc: z.literal('2.0'),
	id: z.union([z.number(), z.string(), z.null()]),
	method: z.string(),
	params: z.unknown()
})

const SuccessfulResponse = z.object({
	jsonrpc: z.literal('2.0'),
	id: z.union([z.number(), z.string(), z.null()]),
	result: z.unknown()
})

const ErrorResponse = z.object({
	jsonrpc: z.literal('2.0'),
	id: z.union([z.number(), z.string(), z.null()]),
	error: z.object({
		code: z.number().refine((code) => code === Number(code.toFixed(0))),
		message: z.string(),
		data: z.unknown().optional()
	})
})

export type JsonRpcRequest = z.infer<typeof JsonRpcRequest>

export const JsonRpcResponse = z.union([SuccessfulResponse, ErrorResponse])
export type JsonRpcResponse = z.infer<typeof JsonRpcResponse>
