"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import abi from "../abi/FixedRewardBurn.json";

// GANTI dengan kontrak burn kamu
const BURN_CONTRACT = "0x732DA80332F445b783E0320DE35eBCB789C8262f";
const TOKEN_DECIMALS = 18;

export default function MiniApp() {
  const [status, setStatus] = useState("Ready.");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // 1️⃣ — GET WALLET POLA YANG BENAR
  async function getWallet() {
    const ethProvider = await sdk.wallet.getEthereumProvider();
    if (!ethProvider) {
      throw new Error("Wallet provider tidak ada. Buka dari Warpcast App.");
    }

    const provider = new BrowserProvider(ethProvider);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
  }

  // 2️⃣ — FUNGSI BURN TOKEN
  async function burnToken() {
    try {
      if (!token) return setStatus("Isi token address dulu");

      setStatus("Processing...");
      setLoading(true);

      const { signer, address } = await getWallet();

      const ERC20 = new Contract(token, [
        "function balanceOf(address) view returns (uint256)",
        "function approve(address spender, uint256 amount)",
      ], signer);

      const balance = await ERC20.balanceOf(address);
      if (balance == 0n) {
        throw new Error("Balance token kamu 0");
      }

      await ERC20.approve(BURN_CONTRACT, balance);

      const burner = new Contract(BURN_CONTRACT, abi, signer);

      const tx = await burner.burnAndClaim(balance);
      await tx.wait();

      setStatus("Success! 🎉");
    } catch (err: any) {
      console.error(err);
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        background: "radial-gradient(circle at top left, #a000ff, #32004e 60%, #000)",
        minHeight: "100vh",
        padding: "24px",
        color: "white",
        fontFamily: "system-ui",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "92%",
          maxWidth: "430px",
          background: "rgba(255,255,255,0.08)",
          padding: "24px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
          🔥 Burn Token → Earn 10 CYT
        </h1>

        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Input token address"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            marginBottom: "16px",
          }}
        />

        <button
          onClick={burnToken}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(90deg, #ff0066, #ff8c00)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {loading ? "Processing..." : "Burn & Claim"}
        </button>

        <p style={{ marginTop: "16px", fontSize: "14px" }}>
          {status}
        </p>
      </div>
    </main>
  );
}
