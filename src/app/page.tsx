"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { sdk } from "@farcaster/miniapp-sdk";
import burnAbi from "../abi/FixedRewardBurn.json";

// alamat kontrak reward/burn kamu
const BURN_CONTRACT = "0x732DA80332f445b783E0320DE35eBCB789c8262f";

// NAMA FUNGSI DI KONTRAK KAMU
// ⚠️ EDIT INI SUPAYA SAMA DENGAN KONTRAK
// misal: "burnAndClaim", "changeYourToken", dll.
const BURN_FUNCTION_NAME = "burnAndClaimAll"; // GANTI nama fungsi sesuai kontrak

const REWARD_SYMBOL = "CYT";
const FIXED_REWARD = "10";

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [status, setStatus] = useState<string>("Paste token address yang mau kamu burn.");
  const [loading, setLoading] = useState(false);

  async function getSigner() {
    const ethProvider = await sdk.wallet.getEthereumProvider();
    if (!ethProvider) {
      throw new Error("Wallet tidak ditemukan. Buka mini app dari Warpcast app, bukan browser biasa.");
    }

    const provider = new BrowserProvider(ethProvider as any);
    const signer = await provider.getSigner();
    return signer;
  }

  async function handleBurn() {
    try {
      if (!tokenAddress) {
        setStatus("Isi dulu alamat token yang mau dibakar.");
        return;
      }

      setLoading(true);
      setStatus("Menghubungkan wallet...");

      const signer = await getSigner();
      const burner = new Contract(BURN_CONTRACT, burnAbi, signer);

      setStatus("Membakar semua token & klaim reward...");

      // ⚠️ BAGIAN PENTING: CALL FUNGSI TANPA AMOUNT
      // Kalau fungsi di kontrak kamu: burnAndClaim(address token)
      // maka barisnya:
      //   const tx = await burner.burnAndClaim(tokenAddress);
      //
      // Kalau namanya beda, samain dengan BURN_FUNCTION_NAME di atas:
      const tx = await burner[BURN_FUNCTION_NAME](tokenAddress);

      const receipt = await tx.wait();
      console.log("Tx hash:", receipt.hash);

      setStatus(`Sukses! Semua token di-burn dan kamu dapat ${FIXED_REWARD} ${REWARD_SYMBOL}.`);
    } catch (err: any) {
      console.error(err);
      setStatus(
        err?.reason ||
          err?.data?.message ||
          err?.message ||
          "Transaksi gagal. Cek chain, kontrak, dan apakah fungsi / parameter sudah benar."
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
        padding: "20px",
        background:
          "radial-gradient(circle at top left, #ff00cc, #5b00f0 40%, #050016)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 28,
          padding: 22,
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(0,0,0,0.75))",
          boxShadow: "0 18px 50px rgba(0,0,0,0.8)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow dekoratif */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 60%)",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 6,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Change Your Token
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            🔥 Burn Token → Earn {FIXED_REWARD} {REWARD_SYMBOL}
          </h1>

          <p
            style={{
              fontSize: 13,
              opacity: 0.86,
              marginBottom: 18,
            }}
          >
            Burn seluruh balance token pilihanmu dan klaim reward tetap{" "}
            <strong>{FIXED_REWARD} {REWARD_SYMBOL}</strong> langsung ke wallet.
          </p>

          <label
            style={{
              display: "block",
              fontSize: 13,
              marginBottom: 6,
              opacity: 0.9,
            }}
          >
            Token address yang mau dibakar
          </label>
          <input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value.trim())}
            placeholder="0x..."
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 14,
              border: "none",
              fontSize: 13,
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              marginBottom: 14,
            }}
          />

          <button
            onClick={handleBurn}
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 999,
              border: "none",
              fontWeight: 700,
              fontSize: 15,
              color: "white",
              background:
                "linear-gradient(90deg, #ff3366, #ff8c00)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
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
              opacity: 0.95,
              whiteSpace: "pre-wrap",
            }}
          >
            {status}
          </p>
        </div>
      </div>
    </main>
  );
}
