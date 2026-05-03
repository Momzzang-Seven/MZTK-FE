export type ActionType = 
    | "QNA_QUESTION_CREATE"
    | "QNA_QUESTION_UPDATE"
    | "QNA_QUESTION_DELETE"
    | "QNA_ANSWER_CREATE"
    | "QNA_ANSWER_UPDATE"
    | "QNA_ANSWER_DELETE"
    | "QNA_ANSWER_ACCEPT";

export type Web3IntentStatus = 
    | "AWAITING_SIGNATURE"
    | "SIGNED"
    | "PENDING_ONCHAIN"
    | "CONFIRMED"
    | "FAILED_ONCHAIN"
    | "EXPIRED"
    | "CANCELED"
    | "NONCE_STALE";

export interface SignRequest {
    // EIP7702: authorization, submit
    authorization: {
        chainId: number; // 체인 ID
        delegateTarget: string; // delegate 대상 주소
        authorityNonce: number; // authority nonce
        payloadHashToSign: string; // 1차 서명 대상 해시
    };
    submit: {
        executionDigest: string; // 2차 서명 대상 digest
        deadlineEpochSeconds: number; // 실행 만료 epoch seconds
    }
    // EIP1559: transaction을 기준으로 지갑에 raw transaction 서명 요청
    transaction: {
        chainId: number; // 체인 ID
        fromAddress: string; // 사용자 지갑 주소
        toAddress: string; // QnA escrow 컨트랙트 주소
        valueHex: string; // 전송 value
        data: string; // call data
        nonce: number; // nonce
        gasLimitHex: string;
        maxPriorityFeePerGasHex: string;
        maxFeePerGasHex: string;
        expectedNonce: number;
    }
}

// 백엔드 -> 프론트
export interface Web3Execution {
    resource: {
        type: "QUESTION" | "ANSWER";
        id: string; // 질문/답변 id
        status: "PENDING_EXECUTION" | "COMPLETED" | "FAILED"; // 리소스 관점 상태
    },
    actionType: ActionType; // 현재 어떤 web3 액션인가
    executionIntent: {
        id: string; // 후속 조회, 실행 폴링 기준 ID
        status: Web3IntentStatus; // 현재 실행 intent 상태
        expiresAt: string; // 서명 유효시간 종료시점
    },
    execution: {
        mode: "EIP7702" | "EIP1559"; // 서명방식 분기 기준
        signCount: number; // 사용자가 몇 번 사용해야 하는지
    },
    signRequest: SignRequest; // 실제 서명 대상 데이터
}

// 프론트 -> 백엔드
export interface ExecuteWeb3TransactionRequest {
    authorizationSignature?: string;
    submitSignature?: string;
    signedRawTransaction?: string;
}

export interface StoredWeb3Action extends Web3Execution {
  summary: string;
}