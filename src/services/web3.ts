import { api } from "@services";
import type { ExecuteWeb3TransactionRequest, ExecutionWeb3Intent } from "@types";

export const web3Service = {
    async executeWeb3Transaction(executionIntentId: string, data: ExecuteWeb3TransactionRequest): Promise<void> {
        const response  = await api.post(`/users/me/web3/execution-intents/${executionIntentId}/execute`, data);
        return response.data.data;
    },

    async getWeb3TransactionStatus(executionIntentId: string): Promise<ExecutionWeb3Intent> {
        const response = await api.get(`/users/me/web3/execution-intents/${executionIntentId}`);
        return response.data.data;
    }
}