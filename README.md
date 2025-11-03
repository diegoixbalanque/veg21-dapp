# 🌱 VEG21 – 21-Day Vegan Habits Challenge

**Gamify your vegan impact and donate transparently on Celo.**

VEG21 is an experimental Web3 dApp designed to motivate people to adopt and maintain vegan habits through gamified challenges, tokenized rewards, and transparent donations to animal and environmental causes.

Originally presented at the **Cripto Latin Fest Hackathon (Astar Network)**, where it earned **3rd place**, VEG21 is now evolving to the **Celo ecosystem**, aligning with its mission of real-world impact and accessible, regenerative Web3 experiences.

---

## 🎯 Project Objectives

* **Gamified vegan habits:** Users participate in 21-day challenges and track their daily progress.
* **Celo integration:** Functional wallet connection, token simulation, and proof-of-action mechanics.
* **Community fund & governance:** Users can donate tokens to verified vegan causes and vote on fund distribution.
* **Vegan Impact Ranking:** A public leaderboard showcasing user achievements and environmental impact.
* **Concept validation:** Functional flow of onboarding, challenges, donations, and ranking — ready to pilot with vegan restaurants and communities.

---

## 💡 Value Proposition

* **Real-world connection:** Enables collaboration with vegan restaurants where customers can receive Celo-based rewards for vegan purchases.
* **Scalable & replicable:** The model can expand to other sustainable lifestyle habits and community-driven initiatives.
* **Inclusive onboarding:** Introduces non-technical users to blockchain through practical and positive experiences.

---

## 🚀 MVP Functionalities

### 🟢 Onboarding & 21-Day Challenge

* Sign up and start the vegan challenge.
* Track daily progress with visual confirmations.

### 🟣 Community Fund

* Explore 2–3 vegan/animal protection causes (demo data).
* Donate tokens (simulated) and view transparent totals.

### 🟢 Vegan Impact Ranking

* Global leaderboard showing participant scores and progress.

---

## 🛠️ Tech Stack

| Layer                              | Technology                  |
| ---------------------------------- | --------------------------- |
| **Frontend**                       | React + Vite + TailwindCSS  |
| **Web3 Connection**                | Celo Mainnet (Forno RPC)    |
| **Wallet Integration**             | Celo Connect / useCelo Hook |
| **Hosting**                        | Replit (MVP Live Demo)      |
| **Blockchain Framework (planned)** | Hardhat + Solidity          |
| **Backend (optional)**             | Supabase (for user data)    |

---

## 🌍 Live Deployment

🔗 **Live Demo:** [https://veg21.replit.app](#)
🔗 **GitHub Repository:** [https://github.com/diegoixbalanque/veg21-dapp](#)

---

## ⚙️ Environment Configuration

**`.env` Example (Celo Mainnet):**

```bash
VITE_VEG21_MODE=celo-mainnet
VITE_DEPLOYER_PUBLIC_ADDRESS=0x8fB54C9698eDfB25Ca8F055554B3A9E06AB75f6C
PRIVATE_KEY=6395600bdd3a8f6d0b19c3268ca44eee3da41bcf2d6677b5d1bf7292fecd2ae5
RPC_URL=https://forno.celo.org
VITE_CELO_MAINNET_RPC_URL=https://forno.celo.org
CHAIN_ID=42220
EXPLORER_URL=https://celoscan.io
```

---

## 🧱 Project Structure

```
src/
├── components/           # UI and interactive components
├── hooks/                # Wallet and blockchain logic
├── pages/                # Challenge, leaderboard, community fund
├── config/               # Environment and network setup
└── assets/               # Media and icons
```

---

## 🔄 Roadmap

### ✅ Milestone 1 – MVP Completion

* Onboarding & 21-day challenge
* Community fund (mock donations)
* Leaderboard
* Wallet integration (Celo Mainnet simulation)

### 🔜 Milestone 2 – Smart Contract Integration

* Real ERC-20 VEG21 token
* Reward distribution for challenge completion
* Proof-of-action validator flow

### 🔮 Milestone 3 – Expansion & Impact Layer

* Verified causes & transparent donation registry
* Staking for community governance
* Mobile-optimized MiniPay integration

---

## 🧩 Future Integrations

* **NFT Achievements:** Reward users for completed challenges.
* **Impact Metrics:** On-chain proof of vegan actions.
* **DAO Governance:** Allow the community to vote on donation distributions.
* **Cross-ecosystem scalability:** Extend model to health, sustainability, and circular economy apps.

---

## 🤝 Community

VEG21 was first presented at the **Cripto Latin Fest (Astar Hackathon)** where it earned **3rd place**.
The project now continues through the **Celo Proof of Ship #9** initiative, supported by **Celo Colombia Builders**, with the goal of building an open, collaborative, and purpose-driven ecosystem.

📢 **Community Channel:** [Celo Colombia Builders – Telegram](https://t.me/celocol)
🌐 **Proof of Ship Page:** [KarmaHQ – VEG21 Project](https://gap.karmahq.xyz/project/veg21-vegan-challenges-and-tokenized-recipes)

---

## 🧠 Video References (Astar Hackathon – Historical MVP)

🎬 **MVP Video:** [https://www.youtube.com/watch?v=exa3p_RJKLU](https://www.youtube.com/watch?v=exa3p_RJKLU)
🎬 **Business Model Pitch:** [https://www.youtube.com/watch?v=w-HQ8DC2E9M](https://www.youtube.com/watch?v=w-HQ8DC2E9M)

---

## 🛡️ Security Notes

* Never commit private keys to the repository.
* Always verify contract addresses before deployment.
* Test on Celo Sepolia or Baklava before Mainnet deployment.

---

## 📜 License

Open source under the MIT License.
Built with purpose and compassion 🌱 — *“From recipes to real-world impact.”*

