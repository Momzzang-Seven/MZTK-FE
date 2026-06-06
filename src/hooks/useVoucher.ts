import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { VOUCHER_ABI } from "@abi";
import { voucherCodeToBytes32, parseAmount } from "@utils/voucher";

export const useVoucher = (voucherAddress: string) => {
  const [account, setAccount] = useState<string>();
  const [voucherContract, setVoucherContract] = useState<ethers.Contract>();
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        alert("MetaMask를 설치해주세요!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const voucher = new ethers.Contract(voucherAddress, VOUCHER_ABI, signer);
      setVoucherContract(voucher);

      const tokenAddress = await voucher.rewardToken();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        signer
      );
      const balance = await tokenContract.balanceOf(voucherAddress);
      setTokenBalance(ethers.formatUnits(balance, 18));
    };

    init();
  }, [voucherAddress]);

  const issueVoucher = async (code: string, amount: string) => {
    if (!voucherContract || !code) return;

    try {
      const tx = await voucherContract.issueVoucher(
        voucherCodeToBytes32(code),
        parseAmount(amount)
      );
      await tx.wait();
      alert("바우처가 발급되었습니다.");
    } catch (err: unknown) {
      console.error("바우처 발급 실패:", err);
      alert("바우처 발급에 실패했습니다.");
    }
  };

  const redeemVoucher = async (code: string) => {
    if (!voucherContract || !code) return;

    try {
      const tx = await voucherContract.redeemVoucher(
        voucherCodeToBytes32(code)
      );
      await tx.wait();
      alert("바우처가 사용되었습니다.");
    } catch (err: unknown) {
      console.error("바우처 사용 실패:", err);
      alert("바우처 사용에 실패했습니다.");
    }
  };

  return { account, tokenBalance, issueVoucher, redeemVoucher };
};
