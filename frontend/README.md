# Frontend — RPG Online

React 19 + Vite 8 + TypeScript + Tailwind CSS v4. Visão geral do projeto, como rodar e status: veja o
[README da raiz](../README.md).

```bash
npm install
npm run dev      # http://localhost:5173 (precisa do backend em :3333)
npm run build    # tsc -b + vite build
npm run lint
```

- Telas em `src/pages/`, componentes em `src/components/`, chamadas à API em `src/services/api.ts`.
- O sistema visual (tokens em `@theme` no `src/index.css`) está documentado em [`DESIGN.md`](../DESIGN.md).
- O frontend nunca calcula valores da ficha: PV/PE/Sanidade e testes vêm prontos do backend.
