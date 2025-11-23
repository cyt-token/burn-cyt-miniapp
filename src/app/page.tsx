"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import fixedRewardBurnAbi from "../abi/FixedRewardBurn10.json";

// alamat kontrak fixed-reward 10 CYT
const FIXED_REWARD_BURN_ADDRESS =
  "0x732DA80332f445b783E0320DE35eBCB789c8262f";

// asumsikan rewardToken dan token yang dibakar punya 18 desimal
const DECIMALS = 18;

// hanya untuk tampilan
const FIXED_REWARD_DISPLAY = "10";

// minimal ABI ERC20 yang kita pakai
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export default function Home() {
  const [tokenToBurn, setTokenToBurn] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingBurn, setLoadingBurn] = useState(false);

  async function getSigner() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("Wallet not found – open with Rabby / MetaMask");
    }
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  }

  async function handleApprove() {
    try {
      setStatus("Checking wallet balance…");
      setLoadingApprove(true);

      const { signer } = await getSigner();
      const userAddress = await signer.getAddress();

      const erc20 = new Contract(tokenToBurn, erc20Abi, signer) as any;

      // approve full balance
      const balance = await erc20.balanceOf(userAddress);

      if (balance === 0n) {
        setStatus("Your balance is 0 – nothing to burn.");
        return;
      }

      const tx = await erc20.approve(FIXED_REWARD_BURN_ADDRESS, balance);
      setStatus("Waiting for approve confirmation…");
      await tx.wait();

      setStatus("Approve success ✅ Now you can Burn & Claim.");
    } catch (err: any) {
      console.error(err);
      setStatus(`Approve failed ❌: ${err.message ?? err.toString()}`);
    } finally {
      setLoadingApprove(false);
    }
  }

  async function handleBurn() {
    try {
      setLoadingBurn(true);
      setStatus("Preparing burn transaction…");

      const { signer } = await getSigner();
      const userAddress = await signer.getAddress();

      const erc20 = new Contract(tokenToBurn, erc20Abi, signer) as any;
      const balance = await erc20.balanceOf(userAddress);

      if (balance === 0n) {
        setStatus("Your balance is 0 – nothing to burn.");
        return;
      }

      const fixedBurn = new Contract(
        FIXED_REWARD_BURN_ADDRESS,
        fixedRewardBurnAbi as any,
        signer
      ) as any;

      // burn full balance, reward 10 CYT (logic di kontrak)
      const tx = await fixedBurn.burnAnyToken(tokenToBurn, balance);
      setStatus("Sending burn tx…");
      await tx.wait();

      setStatus(
        `Burn success ✅ You received a fixed reward of ${FIXED_REWARD_DISPLAY} CYT.`
      );
    } catch (err: any) {
      console.error(err);
      setStatus(`Burn failed ❌: ${err.message ?? err.toString()}`);
    } finally {
      setLoadingBurn(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #2b002b 0, #05040a 40%, #000000 100%)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: "90vw",
          padding: 32,
          borderRadius: 24,
          background:
            "linear-gradient(145deg, rgba(255,0,90,0.15), rgba(0,255,255,0.06))",
          boxShadow:
            "0 0 40px rgba(255,0,90,0.7), 0 0 80px rgba(0,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            fontSize: 14,
            letterSpacing: 1.2,
            textTransform: "uppercase"
          }}
        >
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontWeight: 600, color: "#ff4d7a" }}>Burn → Earn CYT</span>
        </div>

        <h1
          style={{
            fontSize: 26,
            margin: "4px 0 12px",
            fontWeight: 700
          }}
        >
          Burn Token, Get{" "}
          <span style={{ color: "#ff4d7a" }}>{FIXED_REWARD_DISPLAY} CYT</span>
        </h1>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 16 }}>
          Every time you burn{" "}
          <strong>100% of your balance</strong> of a token, you get a fixed reward
          of{" "}
          <strong>
            {FIXED_REWARD_DISPLAY} CYT
          </strong>{" "}
          — no matter how many tokens are burned. Make sure you&apos;re on Base
          and have enough gas.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
            marginBottom: 16,
            padding: "8px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981"
            }}
          />
          <span style={{ opacity: 0.85 }}>Network:</span>
          <strong>Base</strong>
          <span style={{ opacity: 0.35 }}>•</span>
          <span style={{ opacity: 0.85 }}>Reward per burn:</span>
          <strong>{FIXED_REWARD_DISPLAY} CYT</strong>
        </div>

        {/* token address input */}
        <label
          style={{
            display: "block",
            fontSize: 12,
            marginBottom: 6,
            opacity: 0.8
          }}
        >
          Token address to burn
        </label>
        <input
          value={tokenToBurn}
          onChange={(e) => setTokenToBurn(e.target.value.trim())}
          placeholder="0x..."
          style={{
            width: "100%",
            padding: "10px 14px",
            marginBottom: 14,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(5,5,20,0.9)",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            boxShadow: "0 0 0 1px rgba(0,0,0,0)"
          }}
        />

        {/* buttons */}
        <button
          onClick={handleApprove}
          disabled={!tokenToBurn || loadingApprove || loadingBurn}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 999,
            border: "none",
            marginBottom: 10,
            background:
              "linear-gradient(90deg, rgba(148, 163, 184, 0.4), rgba(15, 23, 42, 0.95))",
            color: "#e5e7eb",
            fontSize: 14,
            fontWeight: 500,
            cursor:
              !tokenToBurn || loadingApprove || loadingBurn ? "not-allowed" : "pointer",
            opacity: !tokenToBurn || loadingApprove || loadingBurn ? 0.55 : 1
          }}
        >
          {loadingApprove ? "Approving…" : "1. Approve"}
        </button>

        <button
          onClick={handleBurn}
          disabled={!tokenToBurn || loadingApprove || loadingBurn}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 999,
            border: "none",
            background:
              "radial-gradient(circle at 0 0, #ff8a8a 0, #ff006f 35%, #7c0fff 100%)",
            boxShadow:
              "0 0 24px rgba(255,0,111,0.9), 0 0 40px rgba(124,15,255,0.6)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor:
              !tokenToBurn || loadingApprove || loadingBurn ? "not-allowed" : "pointer",
            opacity: !tokenToBurn || loadingApprove || loadingBurn ? 0.55 : 1,
            marginBottom: 12
          }}
        >
          {loadingBurn ? "Burning…" : "2. Burn & Claim"}
        </button>

        {/* status text */}
        {status && (
          <p
            style={{
              fontSize: 12,
              marginTop: 4,
              color: status.includes("success") ? "#bbf7d0" : "#fecaca"
            }}
          >
            Status: {status}
          </p>
        )}

        <p
          style={{
            marginTop: 16,
            fontSize: 11,
            opacity: 0.55,
            textAlign: "center"
          }}
        >
          Built for degens: burn spam tokens, farm CYT, stay on-chain. ✨
        </p>
      </div>
    </div>
  );
}
