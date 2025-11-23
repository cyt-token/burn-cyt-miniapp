"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import universalBurnAbi from "../abi/UniversalBurn.json";

const UNIVERSAL_BURN_ADDRESS =
  "0xB2fCB0FaAf1e9a66890144486552dEc7b50102F8";

const REWARD_PER_TX = 1000;

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

export default function MiniApp() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Ready.");
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  async function wallet() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    return { provider, signer, address: await signer.getAddress() };
  }

  async function approve() {
    try {
      if (!token) return setStatus("Paste token address.");

      setLoadingA(true);
      setStatus("Checking balance…");

      const { provider, signer, address } = await wallet();
      const erc20 = new Contract(token, erc20Abi, provider);

      const bal = await erc20.balanceOf(address);
      if (bal === 0n) {
        setStatus("You have 0 balance.");
        setLoadingA(false);
        return;
      }

      const tx = await erc20.connect(signer).approve(
        UNIVERSAL_BURN_ADDRESS,
        bal
      );
      await tx.wait();

      setStatus("Approved ✔");
    } catch (e: any) {
      setStatus("Failed: " + (e.shortMessage || e.message));
    } finally {
      setLoadingA(false);
    }
  }

  async function burn() {
    try {
      if (!token) return setStatus("Paste token address.");

      setLoadingB(true);
      setStatus("Burning…");

      const { signer, provider, address } = await wallet();
      const erc20 = new Contract(token, erc20Abi, provider);
      const bal = await erc20.balanceOf(address);

      if (bal === 0n) {
        setStatus("No tokens left to burn.");
        setLoadingB(false);
        return;
      }

      const burn = new Contract(
        UNIVERSAL_BURN_ADDRESS,
        universalBurnAbi,
        signer
      );

      const tx = await burn.burnAnyToken(token, bal);
      await tx.wait();

      setStatus(`Success! You received ${REWARD_PER_TX} CYT.`);
    } catch (e: any) {
      setStatus("Failed: " + (e.shortMessage || e.message));
    } finally {
      setLoadingB(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontFamily: "Inter, sans-serif",

        // ⭐ NEON BACKGROUND (no polos)
        background: `
          radial-gradient(circle at 20% 30%, rgba(255,0,180,0.35), transparent 60%),
          radial-gradient(circle at 80% 70%, rgba(0,180,255,0.35), transparent 60%),
          linear-gradient(180deg, #050505, #020202 60%, #000)
        `,
        backdropFilter: "blur(6px)",
        position: "relative",
      }}
    >

      {/* Noise overlay */}
      <div style={{
        content: "",
        position: "absolute",
        inset: 0,
        backgroundImage:
          "url('https://grainy-gradients.vercel.app/noise.svg')",
        opacity: 0.15,
        pointerEvents: "none",
      }}/>

      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 20,
          borderRadius: 16,
          background: "rgba(10,10,10,0.6)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: `
            0 0 25px rgba(255,0,180,0.3),
            inset 0 0 8px rgba(255,255,255,0.05)
          `,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 18,
            background: "linear-gradient(135deg, #ff00c8, #00b7ff)",
            filter: "blur(18px)",
            opacity: 0.35,
            zIndex: -1,
          }}
        />

        <h2 style={{ textAlign: "center", marginBottom: 6, fontSize: 20 }}>
          🔥 Burn → Earn CYT
        </h2>

        <p
          style={{
            fontSize: 12,
            textAlign: "center",
            marginBottom: 15,
            color: "#bbb",
          }}
        >
          Burn your entire balance & earn {REWARD_PER_TX} CYT.
        </p>

        <input
          placeholder="Token address (0x...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 10,
            background: "#000",
            border: "1px solid #333",
            color: "#fff",
            fontSize: 13,
            boxShadow: "0 0 8px rgba(0,180,255,0.25)",
          }}
        />

        <button
          onClick={approve}
          disabled={loadingA}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 10,
            background: "linear-gradient(90deg, #444, #333)",
            border: "none",
            boxShadow: "0 0 12px rgba(255,0,180,0.25)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loadingA ? "Approving…" : "Approve"}
        </button>

        <button
          onClick={burn}
          disabled={loadingB}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 10,
            background: "linear-gradient(90deg, #ff006a, #ff0055)",
            border: "none",
            boxShadow: "0 0 14px rgba(255,0,100,0.55)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loadingB ? "Burning…" : "Burn & Claim"}
        </button>

        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 12,
            color: "#aaa",
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}
