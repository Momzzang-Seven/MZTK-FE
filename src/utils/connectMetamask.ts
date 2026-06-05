import { PostIssueChallenge, PostVerifyChallenge } from "@services/auth";
import { ethers } from "ethers";
import axios from "axios";

const VOUCHER_ADDRESS = import.meta.env.VITE_VOUCHER_ADDRESS;

export const connectMetamask = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address };
};

export const loginWithMetamask = async () => {
  try {
    const { address } = await connectMetamask();

    // Issue challenge
    const challengeMsg = await PostIssueChallenge(address);

    const domain = {
      name: "VoucherLogin",
      version: "1",
      chainId: 11155111,
      verifyingContract: VOUCHER_ADDRESS,
    };

    const types = {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Login: [{ name: "message", type: "string" }],
    };
    const message = { message: challengeMsg };

    const typedData = JSON.stringify({
      domain,
      types,
      primaryType: "Login",
      message,
    });

    // Sign
    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [address, typedData],
    });

    // Verify
    const response = await PostVerifyChallenge(address, signature);
    // Expecting response to contain { userInfo, accessToken } like other logins
    // If backend only returns jwt, we might need to map it.
    // For now assuming the backend will follow the standard LoginResponseDTO structure.

    // Check if response has data property (axios response) or if PostVerifyChallenge returns data directly
    // connectMetamask.ts line 54 says: const jwt = await PostVerifyChallenge...
    // Let's check auth.ts PostVerifyChallenge implementation.
    // auth.ts: return data; (which is the body)

    return response;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new Error("지갑 또는 서명 정보를 확인해 주세요.");
    }
    throw err;
  }
};
