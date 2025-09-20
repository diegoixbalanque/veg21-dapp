# VEG21 – 21 Días de Hábitos Veganos 🌱

**Gamifica tu impacto vegano y dona con ASTR**

VEG21 es una **dApp experimental** diseñada para motivar a las personas a adoptar hábitos veganos mediante retos, recompensas tokenizadas y donaciones a causas de protección animal y ambiental.  
El MVP demuestra un flujo funcional que puede integrarse con negocios locales y expandirse a otros proyectos Web3.

---

## 🎯 Objetivos del proyecto

- **Gamificación de hábitos veganos**: los usuarios participan en retos de 21 días y registran su progreso.  
- **Integración con ASTR**: simulación de wallets y tokens ASTR para participar en retos y donaciones.  
- **Fondo comunitario y gobernanza**: los usuarios pueden donar tokens a asociaciones de protección y votar cómo distribuir el fondo.  
- **Ranking de impacto vegano**: leaderboard que muestra el impacto de cada participante.  
- **Validación de concepto**: flujo funcional de onboarding, retos, donaciones y ranking, listo para probar con un restaurante vegano.

---

## 💡 Valor agregado

- **Integración con un restaurante vegano local**: los clientes pueden recibir tokens ASTR al comprar productos especiales, conectando el consumo real con la plataforma Web3.  
- **Plataforma replicable y extensible**: puede incorporar otros negocios, proyectos de hábitos saludables o iniciativas comunitarias.  
- **Permite experimentación en Web3**: onboarding de usuarios no técnicos, gamificación y uso de tokens en un escenario real.  

---

## 🚀 Funcionalidades del MVP

- **Landing Page**
  - Título y descripción del reto “21 Días de Hábitos Veganos”.  
  - Botón de conexión de wallet (simulación con ethers.js).  

- **Retos Activos**
  - Unirse a un reto y ver progreso.  
  - Confirmaciones visuales de participación.  

- **Fondo Comunitario VEG21**
  - 2–3 causas de protección animal (datos de prueba).  
  - Donaciones con tokens simulados y contador visible.  

- **Ranking de Impacto Vegano**
  - Tabla simple con leaderboard de participantes.  

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS  
- **Simulación Web3**: ethers.js para conexión de wallet y tokens ASTR  
- **Hosting del MVP**: [Render Deploy](https://veg21-dapp.onrender.com)  
- **Extensible a**: smart contracts reales en Astar, staking, NFTs y gobernanza on-chain  

---

## 📦 Cómo probar el MVP

1. Clona este repositorio:

```bash
git clone https://github.com/diegoixbalanque/veg21-dapp.git
cd veg21-dapp
```

2. Instala dependencias:

```bash
npm install
```

3. Inicia la aplicación:

```bash
npm run dev
```

4. Abre el navegador en http://localhost:5173

También puedes ver la demo en vivo aquí:
👉 https://veg21-dapp.onrender.com

---

## 🏗️ Smart Contract Integration Layer (Sprint 8)

VEG21 ahora incluye una **capa de integración de contratos inteligentes** que permite alternar entre:

- **Modo Mock** - Funcionalidad blockchain simulada (por defecto)
- **Modo Contract** - Interacción real con contratos inteligentes en Astar Network

### 🔧 Configuración del Entorno

Por defecto, la dApp funciona en **modo mock** para desarrollo:

```bash
# Variables de entorno (.env)
VITE_MOCK_MODE=true          # Usar modo mock (por defecto)
VITE_ENVIRONMENT=development # Entorno objetivo
```

#### Entornos Disponibles

- `development` - Desarrollo local con contratos mock
- `testnet` - Deployment en testnet de Astar  
- `mainnet` - Deployment en mainnet de Astar
- `local` - Red local Hardhat

### 🔄 Cambiar Entre Modos

**Modo Mock (Actual)**
```bash
VITE_MOCK_MODE=true
```

**Modo Contract (Para blockchain real)**
```bash
VITE_MOCK_MODE=false
VITE_ENVIRONMENT=testnet
```

### 📑 Contratos Soportados

La dApp está diseñada para trabajar con estos contratos inteligentes:

1. **VEG21 Token Contract** - Token ERC20 del ecosistema
2. **Staking Contract** - Staking de tokens con 5% APY
3. **Donations Contract** - Gestión de contribuciones benéficas  
4. **Rewards Contract** - Sistema de recompensas por hitos

### 🚀 Deployment Real de Contratos

#### Paso 1: Deployar Contratos

```bash
# Ejemplo de script de deployment (por crear)
npx hardhat run scripts/deploy.js --network astar-testnet
```

#### Paso 2: Actualizar Direcciones

Actualiza la configuración con las direcciones deployadas:

```typescript
// client/src/config/contracts.ts
export const ASTAR_TESTNET_CONFIG: ContractConfig = {
  addresses: {
    staking: '0xTuDireccionStaking',
    donations: '0xTuDireccionDonations', 
    rewards: '0xTuDireccionRewards',
    token: '0xTuDireccionToken',
  },
  // ... resto de configuración
};
```

#### Paso 3: Activar Modo Contract

```bash
VITE_MOCK_MODE=false
VITE_ENVIRONMENT=testnet
```

### 📁 Estructura de Archivos

```
client/src/
├── types/
│   └── contracts.ts           # Interfaces de contratos
├── contracts/
│   ├── StakingContract.json   # ABI de Staking
│   ├── DonationsContract.json # ABI de Donations  
│   ├── RewardsContract.json   # ABI de Rewards
│   └── TokenContract.json     # ABI de Token
├── config/
│   └── contracts.ts           # Configuración de red y direcciones
├── lib/
│   ├── contractService.ts     # Capa de servicio de contratos
│   └── mockWeb3.ts           # Servicio Web3 mock (existente)
└── hooks/
    └── use-mock-web3.tsx     # Hook mejorado con soporte de contratos
```

### ⚠️ Notas Importantes

#### Compatibilidad Hacia Atrás

- Todos los componentes UI existentes continúan funcionando sin cambios
- El modo mock sigue siendo el por defecto para desarrollo
- No hay cambios que rompan la funcionalidad existente

#### Para Deployment en Producción

Para deployment en producción con contratos reales:

1. ✅ Deployar los cuatro contratos inteligentes
2. ✅ Actualizar direcciones en la configuración
3. ✅ Configurar `VITE_MOCK_MODE=false`
4. 🚧 Implementar lógica de interacción real con contratos
5. ✅ Probar exhaustivamente en testnet primero

#### Seguridad

- Nunca commitear claves privadas o secretos
- Validar todas las direcciones de contratos antes del deployment
- Probar todas las funciones en testnet antes de mainnet
- Implementar manejo de errores para fallos de contratos

🔗 Smart Contract & Testnet

Actualmente este MVP no requiere aún un contrato on-chain para su funcionamiento inicial.
El diseño contempla que en la siguiente iteración se desplegará un contrato en Astar testnet encargado de:

- Distribuir recompensas en ASTR a los usuarios que completen retos.

- Gestionar regalías de recetas tokenizadas.

Dirección de contrato en testnet: Por definir en la próxima versión.

☁️ Startale Cloud Services

Este MVP no utiliza Startale Cloud Services, pero se considera como una opción futura para integrar:

- Gestión de infraestructura on-chain.

- Servicios complementarios para gobernanza y escalabilidad.

🔮 Futuras expansiones

- Integración real con ASTR y contratos inteligentes para staking y gobernanza.

- Incorporación de NFTs por participación o hitos alcanzados.

- Integración con otros restaurantes, comunidades y proyectos Web3.

- Gamificación más avanzada: logros, recompensas y eventos temáticos.

🤝 Conexión con la comunidad

Este proyecto sirve como hub experimental donde participantes y negocios locales pueden:

- Probar experiencias Web3 sin necesidad de conocimientos técnicos avanzados.

- Explorar nuevas dinámicas de consumo, impacto social y gamificación.

- Conectar con otros proyectos y validar ideas en un entorno real y seguro.


VIDEO MVP:
https://www.youtube.com/watch?v=exa3p_RJKLU

VIDEO BUSINESS MODEL:
https://www.youtube.com/watch?v=w-HQ8DC2E9M
