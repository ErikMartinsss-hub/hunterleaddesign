# Design Hunter Lead — AI assets

Prompts e destinos para os visuais cinematográficos do frontend. Todos os prompts evitam texto dentro da imagem; textos e badges devem ser aplicados em HTML/CSS.

Palette fixa:

- Fundo: `#090514` → `#130928`
- Violeta: `#8B5CF6`
- Cyan: `#06B6D4`
- Emerald: `#10B981`

## 1. Hero radar background

Destino: `public/assets/hero-radar-bg.png`

Uso: fundo do hero atrás do título e da search bar.

Prompt:

```text
Wide 16:9 cinematic hero background for a dark futuristic SaaS dashboard. Aerial night city transformed into an abstract radar map, concentric radar rings and a subtle sweeping scan beam, tiny glowing location nodes, deep near-black purple base colors #090514 and #130928, neon violet #8B5CF6, cyan #06B6D4 and emerald #10B981 accents. Volumetric light, soft fog, fine film grain, high contrast, premium product design, clean negative space in the center-left for headline overlay. No text, no letters, no logos, no watermark, no UI elements.
```

## 2. Ambient wave background

Destino: `public/assets/ambient-wave-bg.png`

Uso: textura discreta atrás dos cards e das seções inferiores.

Prompt:

```text
Wide 16:9 ambient background texture for a dark futuristic web app. Abstract flowing wave field made of tiny particles and thin luminous lines, soft depth of field, deep near-black purple gradient #090514 to #130928, restrained violet #8B5CF6, cyan #06B6D4 and emerald #10B981 glow, calm low-contrast motion-friendly composition, premium glassmorphism mood, subtle noise, no focal object, suitable to sit behind UI cards. No text, no letters, no logos, no watermark, no UI elements.
```

## 3. Lead opportunity card

Destino: `public/assets/lead-opportunity-card.png`

Uso: arte de destaque em cards de oportunidade alta ou empty state.

Prompt:

```text
Square 1:1 cinematic illustration for a lead opportunity card in a dark SaaS app. A glowing emerald location pin hovering over a small local business storefront silhouette, faint radar rings expanding outward, dark purple night atmosphere, neon violet #8B5CF6 and cyan #06B6D4 edge lights, emerald #10B981 focal highlight, clean centered composition with empty space at top and bottom for UI labels, polished 3D render aesthetic, dramatic lighting, high detail. No text, no letters, no logos, no watermark, no UI elements.
```

## 4. AI pitch modal background

Destino: `public/assets/pitch-ai-bg.png`

Uso: fundo do modal de pitch com IA.

Prompt:

```text
Wide 16:9 cinematic background for an AI pitch modal in a dark futuristic SaaS product. Abstract chat message shape formed from luminous particles and fine neural network lines, violet #8B5CF6 core, cyan #06B6D4 and emerald #10B981 accents, deep near-black purple #090514 background, soft glass reflections, subtle depth and bloom, elegant and premium, composition leaves clear central area for text overlay. No text, no letters, no logos, no watermark, no UI elements.
```

## Status

Geração via ferramenta embutida falhou com `Invalid credential`. Caminho escolhido: geração local na RX 7600.

- `E:\hunter-leads\portable-local-studio`: `techjarves/Portable-Local-Studio`, sucessor ativo de `Portable-Diffusion`.
- Windows + AMD usa backend Vulkan nativo. Sem API key e sem login.
- Backend Vulkan instalado e build do frontend concluído.
- Modelo: `Juggernaut_RunDiffusionPhoto2_Lightning_4Steps.safetensors` (~6.6 GB), SDXL 4 steps.
- Fonte: Civitai `https://civitai.com/api/download/models/357609` (~6.5 MB/s); Hugging Face ficou em ~0.5 MB/s.
- Script: `E:\hunter-leads\portable-local-studio\scripts\generate-hunter-assets.mjs`.
- Os prompts acima foram adaptados no script para SDXL, com negative prompt controls.
- Saída: `E:\hunter-leads\hunter-lead\public\assets\`.

Geração concluída na RX 7600 via backend Vulkan. Quatro PNGs em `public/assets/`, integrados em `src/App.tsx`, `AmbientBackground.tsx`, `LeadCard.tsx` e `PitchModal.tsx`.
