"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import abi from "../abi/FixedRewardBurn.json"; // ABI dari file kamu

// KONTRAK BARU FIXED REWARD 10 CYT
const BURN_CONTRACT = "0x732DA80332f445b783E0320DE35eBCB789c8262f";

export default function MiniApp() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Ready.");
  const [loading, setLoading] = useState(false);

  async function getWallet() {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  }

  async function burnToken() {
    try {
      if (!token) return setStatus("Paste the token address first.");

      setLoading(true);
      setStatus("Processing…");

      const { provider, signer, address } = await getWallet();

      const ERC20 = new Contract(token, [
        "function balanceOf(address) view returns (uint256)",
        "function transferFrom(address,address,uint256) returns (bool)"
      ], provider);

      const bal = await ERC20.balanceOf(address);
      if (bal === 0n) {
        setStatus("You don't have tokens to burn.");
        setLoading(false);
        return;
      }

      const Burn = new Contract(BURN_CONTRACT, abi, signer);

      const tx = await Burn.burnAnyToken(token);
      await tx.wait();

      setStatus("Success! You received 10 CYT 🎉");
    } catch (e: any) {
      setStatus("Error: " + (e?.shortMessage || e?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1a002c 0%, #000 60%, #000 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      {/* GLOW BACKGROUND ORB */}
      <div
        style={{
          position: "fixed",
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          background: "rgba(255,0,200,0.25)",
          filter: "blur(140px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* CARD */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 22,
          borderRadius: 18,
          background: "rgba(20,20,20,0.7)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 25px rgba(255,0,200,0.25), inset 0 0 20px rgba(255,255,255,0.04)",
          position: "relative",
        }}
      >
        {/* NEON BORDER */}
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, #ff00d4, #0066ff, #ff00d4)",
            zIndex: -1,
            filter: "blur(18px)",
            opacity: 0.6,
          }}
        />

        <h2
          style={{
            textAlign: "center",
            marginBottom: 6,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          🔥 Burn → Earn 10 CYT
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            marginBottom: 16,
            color: "#ccc",
          }}
        >
          Burn any token & instantly claim your reward.
        </p>

        {/* INPUT */}
        <input
          placeholder="Token address (0x...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            background: "#000",
            color: "#fff",
            border: "1px solid #444",
            marginBottom: 14,
            fontSize: 14,
            boxShadow: "0 0 12px rgba(0,200,255,0.25)",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={burnToken}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, #ff0077, #ff0055)",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 0 14px rgba(255,0,90,0.7)",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          {loading ? "Burning…" : "Burn & Claim 10 CYT"}
        </button>

        {/* STATUS */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#bbb",
            marginTop: 10,
            minHeight: 20,
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}
