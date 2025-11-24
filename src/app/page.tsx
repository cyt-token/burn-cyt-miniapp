"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import burnAbi from "../abi/FixedRewardBurn.json";

// =======================
//  KONFIGURASI KONTRAK
// =======================

// token yang akan DIBAKAR user
// TODO: ganti dengan alamat token burn kamu yang BENAR
const BURN_TOKEN = "0xcbb6e8190196dec50c53964518ce2e0000000000"; // contoh placeholder

// kontrak burn + reward (punya kamu)
const BURN_CONTRACT = "0x732DA80332f445b783E0320DE35eBCB789c8262f";

// konfigurasi token
const TOKEN_DECIMALS = 18;
const REWARD_SYMBOL = "CYT";
const FIXED_REWARD = "10";

export default function Page() {
  const [amount, setAmount] = useState("10");
  const [status, setStatus] = useState<string>("Ready.");
  const [loading, setLoading] = useState(false);

  async function getSigner() {
    // ambil provider dari Farcaster Mini App
    const ethProvider = await sdk.wallet.getEthereumProvider();
    if (!ethProvider) {
      throw new Error("Wallet tidak ditemukan. Buka mini app dari Warpcast, bukan browser.");
    }

    const provider = new BrowserProvider(ethProvider as any);
    const signer = await provider.getSigner();
    return signer;
  }

  async function handleBurn() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Isi jumlah token yang mau dibakar dulu.");
        return;
      }

      setLoading(true);
      setStatus("Menyiapkan transaksi...");

      const signer = await getSigner();
      const userAddress = await signer.getAddress();

      // -----------------------
      // 1. APPROVE TOKEN BURN
      // -----------------------
      setStatus("Approve token yang akan dibakar...");

      const erc20 = new Contract(
        BURN_TOKEN,
        [
          "function balanceOf(address) view returns (uint256)",
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        signer
      );

      const balance: bigint = await erc20.balanceOf(userAddress);
      const amountToBurn = parseUnits(amount, TOKEN_DECIMALS);

      if (balance < amountToBurn) {
        throw new Error("Balance tokenmu kurang untuk jumlah yang diminta.");
      }

      const approveTx = await erc20.approve(BURN_CONTRACT, amountToBurn);
      await approveTx.wait();

      // -----------------------
      // 2. CALL KONTRAK BURN
      // -----------------------
      setStatus("Membakar token & mengklaim reward...");

      const burner = new Contract(BURN_CONTRACT, burnAbi, signer);

      // asumsi fungsi: burnAndClaim(uint256 amount)
      const tx = await burner.burnAndClaim(amountToBurn);
      const receipt = await tx.wait();

      console.log("Tx hash:", receipt.hash);
      setStatus(`Sukses! Kamu dapat ${FIXED_REWARD} ${REWARD_SYMBOL}.`);
    } catch (err: any) {
      console.error(err);
      setStatus(
        err?.reason ||
        err?.data?.message ||
        err?.message ||
        "Transaksi gagal (cek chain / kontrak / saldo / allowance)."
      );
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
        padding: "24px",
        background:
          "radial-gradient(circle at top left, #ff00cc, #5b00a8 45%, #050018)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          padding: 24,
          borderRadius: 24,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.65))",
          boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          🔥 Burn Token → Earn {FIXED_REWARD} {REWARD_SYMBOL}
        </h1>

        <p style={{ opacity: 0.8, marginBottom: 18, fontSize: 14 }}>
          Burn your token and instantly claim a fixed reward of{" "}
          {FIXED_REWARD} {REWARD_SYMBOL}.
        </p>

        <div
          style={{
            fontSize: 11,
            opacity: 0.8,
            marginBottom: 12,
            textAlign: "left",
          }}
        >
          Token to burn:
          <div
            style={{
              marginTop: 4,
              padding: 10,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.75)",
              wordBreak: "break-all",
            }}
          >
            {BURN_TOKEN}
          </div>
        </div>

        <label
          style={{
            display: "block",
            textAlign: "left",
            fontSize: 13,
            marginBottom: 6,
          }}
        >
          Amount to burn
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            marginBottom: 16,
            fontSize: 15,
          }}
        />

        <button
          disabled={loading}
          onClick={handleBurn}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 999,
            border: "none",
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            background:
              "linear-gradient(90deg, #ff3366, #ff8c00)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Processing..." : `Burn & Claim ${FIXED_REWARD} ${REWARD_SYMBOL}`}
        </button>

        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            minHeight: 32,
            opacity: 0.9,
            whiteSpace: "pre-wrap",
          }}
        >
          {status}
        </p>
      </div>
    </main>
  );
}
