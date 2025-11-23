"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import universalBurnAbi from "../abi/UniversalBurn.json";

const UNIVERSAL_BURN_ADDRESS =
  "0xB2fCB0FaAf1e9a66890144486552dEc7b50102F8";

const REWARD_PER_TX = 1000;

// ABI minimal ERC20
const erc20Abi = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

async function getWallet() {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export default function MiniApp() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Ready.");
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // 1) APPROVE
  async function approve() {
    try {
      if (!token) return setStatus("Paste token address first.");

      setLoadingA(true);
      setStatus("Checking balance…");

      const { signer, address } = await getWallet();

      // paksa jadi "any" supaya TS nggak protes approve()
      const erc20 = new Contract(token, erc20Abi, signer) as any;

      const bal: bigint = await erc20.balanceOf(address);
      if (bal === 0n) {
        setStatus("You have 0 balance for this token.");
        setLoadingA(false);
        return;
      }

      const tx = await erc20.approve(UNIVERSAL_BURN_ADDRESS, bal);
      await tx.wait();

      setStatus("Approved ✔ You can now Burn & Claim.");
    } catch (e: any) {
      setStatus("Failed: " + (e.shortMessage || e.message || "unknown"));
    } finally {
      setLoadingA(false);
    }
  }

  // 2) BURN & CLAIM
  async function burn() {
    try {
      if (!token) return setStatus("Paste token address first.");

      setLoadingB(true);
      setStatus("Burning your full balance…");

      const { signer, address, provider } = await getWallet();

      const erc20 = new Contract(token, erc20Abi, signer) as any;
      const bal: bigint = await erc20.balanceOf(address);

      if (bal === 0n) {
        setStatus("No tokens left to burn.");
        setLoadingB(false);
        return;
      }

      const burnContract = new Contract(
        UNIVERSAL_BURN_ADDRESS,
        universalBurnAbi,
        signer
      );

      const tx = await burnContract.burnAnyToken(token, bal);
      await tx.wait();

      setStatus(`Success! You received ${REWARD_PER_TX} CYT.`);
    } catch (e: any) {
      setStatus("Failed: " + (e.shortMessage || e.message || "unknown"));
    } finally {
      setLoadingB(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        // BACKGROUND NEON (nggak polos)
        background:
          "radial-gradient(circle at top, rgba(255,0,140,0.25), transparent 55%)," +
          "radial-gradient(circle at bottom, rgba(0,183,255,0.25), transparent 55%)," +
          "linear-gradient(180deg, #020008 0%, #050410 45%, #020008 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 20,
          borderRadius: 18,
          background: "rgba(8,8,16,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 25px rgba(255,0,180,0.35), 0 0 25px rgba(0,180,255,0.3), inset 0 0 18px rgba(255,255,255,0.02)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glow pinggiran */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 20,
            background: "linear-gradient(135deg,#ff00c8,#00b7ff)",
            filter: "blur(18px)",
            opacity: 0.25,
            zIndex: -1,
          }}
        />

        <h2 style={{ textAlign: "center", marginBottom: 4, fontSize: 20 }}>
          🔥 Burn → Earn CYT
        </h2>

        <p
          style={{
            fontSize: 12.5,
            textAlign: "center",
            marginBottom: 14,
            color: "#cbd5f5",
          }}
        >
          Burn your entire balance and get{" "}
          <b style={{ color: "#ff66bf" }}>{REWARD_PER_TX} CYT</b> per burn.
        </p>

        <input
          placeholder="Token address (0x...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            background: "#050510",
            border: "1px solid #353564",
            color: "#fff",
            marginBottom: 12,
            fontSize: 13,
            boxShadow: "0 0 10px rgba(0,183,255,0.25)",
          }}
        />

        <button
          onClick={approve}
          disabled={loadingA}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 14,
            background: loadingA
              ? "linear-gradient(90deg,#4b5563,#374151)"
              : "linear-gradient(90deg,#4b5563,#1f2937)",
            border: "none",
            marginBottom: 10,
            cursor: "pointer",
            color: "#f9fafb",
            boxShadow: "0 0 12px rgba(255,0,180,0.3)",
          }}
        >
          {loadingA ? "Approving…" : "1. Approve"}
        </button>

        <button
          onClick={burn}
          disabled={loadingB}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 14,
            background: loadingB
              ? "linear-gradient(90deg,#b91c1c,#7f1d1d)"
              : "linear-gradient(90deg,#ff006a,#ff0050)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            boxShadow: "0 0 16px rgba(255,0,100,0.7)",
          }}
        >
          {loadingB ? "Burning…" : "2. Burn & Claim"}
        </button>

        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            textAlign: "center",
            color: "#e5e7eb",
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}
