"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import burnAbi from "../abi/FixedRewardBurn.json";

// Contract address (your burn + reward contract)
const BURN_CONTRACT = "0x732DA80332f445b783E0320DE35eBCB789c8262f";

// TODO — replace later after ABI check
const CONTRACT_FUNCTION_NAME = "REPLACE_ME";

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [status, setStatus] = useState("Enter the token address you want to burn.");
  const [loading, setLoading] = useState(false);

  async function getSigner() {
    const ethProvider = await sdk.wallet.getEthereumProvider();
    if (!ethProvider) throw new Error("Wallet not found. Please open this Mini App inside Warpcast.");

    const provider = new BrowserProvider(ethProvider as any);
    return provider.getSigner();
  }

  async function handleBurn() {
    try {
      if (!tokenAddress) {
        setStatus("Please enter a token address.");
        return;
      }

      setLoading(true);
      setStatus("Preparing transaction...");

      const signer = await getSigner();
      const burner = new Contract(BURN_CONTRACT, burnAbi, signer);

      setStatus("Executing burn + reward transaction...");

      // TODO — replace after ABI inspection
      const tx = await burner[CONTRACT_FUNCTION_NAME](tokenAddress);
      await tx.wait();

      setStatus("Success! Your tokens were burned and you received 10 CYT.");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background:
          "radial-gradient(circle at top left, #ff00cc, #5b00f0 40%, #070019)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 28,
          borderRadius: 28,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
          🔥 Burn Token → Earn 10 CYT
        </h1>

        <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 20 }}>
          Burn the entire balance of any token and instantly receive a fixed reward of <b>10 CYT</b>.
        </p>

        <label style={{ fontSize: 13, marginBottom: 6, display: "block" }}>
          Token address to burn
        </label>

        <input
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            marginBottom: 16,
            background: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: 14,
          }}
        />

        <button
          disabled={loading}
          onClick={handleBurn}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 999,
            border: "none",
            fontSize: 16,
            fontWeight: 700,
            color: "white",
            background: "linear-gradient(90deg, #ff3366, #ff8c00)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Processing..." : "Burn & Claim 10 CYT"}
        </button>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.9 }}>
          {status}
        </p>
      </div>
    </main>
  );
}
