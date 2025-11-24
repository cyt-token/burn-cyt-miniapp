"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import burnAbi from "../abi/FixedRewardBurn.json";

const CONTRACT = "0x732DA80332f445b783E0320DE35eBCB789c8262f";

export default function Page() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function getSigner() {
    const eth = await sdk.wallet.getEthereumProvider();
    if (!eth) throw new Error("Please open in Warpcast");
    const provider = new BrowserProvider(eth);
    return provider.getSigner();
  }

  async function burn() {
    try {
      if (!token) return setStatus("Token address required");
      setLoading(true);
      setStatus("Burning...");

      const signer = await getSigner();
      const contract = new Contract(CONTRACT, burnAbi, signer);

      const tx = await contract.burnAnyToken(token);
      await tx.wait();

      setStatus("🔥 Success! Token burned + 10 CYT rewarded.");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ff00aa, #6a00ff)",
        fontFamily: "Inter, sans-serif",
        color: "white"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 20,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          backdropFilter: "blur(12px)"
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          🔥 Burn Token → Earn 10 CYT
        </h2>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
          Burn any ERC-20 token and instantly receive a fixed reward.
        </p>

        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token address (0x...)"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 12,
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "white",
            marginBottom: 14,
            fontSize: 13
          }}
        />

        <button
          disabled={loading}
          onClick={burn}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(90deg, #ff4d4d, #ff9900)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Processing..." : "Burn & Claim 10 CYT"}
        </button>

        <p style={{ marginTop: 14, fontSize: 12, opacity: 0.9 }}>
          {status}
        </p>
      </div>
    </main>
  );
}
