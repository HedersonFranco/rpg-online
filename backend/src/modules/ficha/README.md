# Módulo ficha

Fichas de personagem de Ordem Paranormal RPG v1.3 (OP1): atributos, NEX, recursos, perícias treinadas e entradas (rituais, habilidades, poderes, equipamentos). Os valores derivados são calculados aqui, pelo motor em `engine/`.

## Rotas

Criação e listagem ficam em `sala.routes.ts`; o resto em `/fichas` (`server.ts`). Todas exigem autenticação.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| POST | `/salas/:id/fichas` | membro da sala | Cria ficha OP1 com PV/PE/San máximos calculados e atuais = máximos (201). `400` em sala OP2 ou campo inválido; `404` não-membro. |
| GET | `/salas/:id/fichas` | membro da sala | Lista todas as fichas da sala. |
| GET | `/fichas/:id` | membro da sala da ficha | Uma ficha. `404` se não existe ou não é membro. |
| PATCH | `/fichas/:id` | dono da ficha ou mestre | Altera campos; recalcula máximos se mudou NEX, classe ou atributo. `400` validação; `403`. |
| POST | `/fichas/:id/pericias` | dono da ficha ou mestre | Define o grau `{ nome, nivel }` de uma perícia (upsert). `400` nível inválido; `403`; `404` perícia inexistente. |
| POST | `/fichas/:id/entradas` | dono da ficha ou mestre | Cria entrada (201), devolve `{ ficha }`. `400`; `403`. |
| PATCH | `/fichas/:id/entradas/:entradaId` | dono da ficha ou mestre | Edita entrada, devolve `{ ficha }`. `400`; `403`; `404` entrada não é desta ficha. |
| DELETE | `/fichas/:id/entradas/:entradaId` | dono da ficha ou mestre | Apaga entrada, devolve `{ ficha }`. `403`; `404`. |

## Regras

- Só salas `ORDEM_PARANORMAL_1` aceitam ficha por aqui; sala OP2 recebe `400`.
- Criação: `nome`, `origem` e `trilha` obrigatórios (não vazios); `for/agi/int/vig/pre` inteiros ≥ 0; `nex` padrão 5. No PATCH, campo ausente não é alterado.
- `classe` precisa ser COMBATENTE, ESPECIALISTA ou OCULTISTA e `nex` um dos 20 degraus (5, 10, …, 95, 99) — senão `400` com o motivo (`motivoClasseNexInvalidos()` em `engine/progressaoClasse.ts`), na criação e no PATCH que recalcula.
- Qualquer membro da sala lê qualquer ficha dela; não-membro recebe `404`.
- Edição: permitida se `ficha.usuario_id` é o usuário, ou se ele tem papel `MESTRE` na sala; senão `403`.
- `pv_atual`, `pe_atual`, `san_atual` devem ser inteiros entre 0 e o máximo (já recalculado) — senão `400`.
- `pv/pe/san_maximo_cache` são gravados a partir de `calcularFicha()`; nunca vêm do cliente.
- `inventario`: texto de até 10.000 caracteres.
- Graus de perícia: `DESTREINADO`, `TREINADO`, `VETERANO`, `EXPERT`. Perícia sem linha em `FichaPericia` sai como Destreinado.
- Toda ficha devolvida traz `testesPericias` (as 28 de `PERICIAS_OP1`, via `montarTestesPericias`) e `habilidadesDesbloqueadas` (via `habilidadesAcumuladas` sobre `ProgressaoClasse`).
- Entradas (`FichaEntrada`):
  - Tipos `RITUAL`, `HABILIDADE`, `PODER`, `EQUIPAMENTO`; campo específico de outro tipo é rejeitado com `400`.
  - Nome obrigatório até 100 caracteres; descrição até 4.000.
  - Ritual: `circulo` 1–4 e `elemento` em `SANGUE/MORTE/CONHECIMENTO/ENERGIA/MEDO/VARIA`.
  - Poder: `preRequisito` opcional até 200 caracteres.
  - Equipamento: `categoria` 0–4 e `espacos` 0–99.
  - O tipo não pode mudar depois de criado (`400`). Na edição, a validação vale para o estado final (gravado + enviado).
- Tempo real: criar/editar ficha, treinar perícia e criar/editar/apagar entrada emitem `emitirParaSala(salaId, 'ficha:atualizada', { ficha })` depois de gravar.

## Dependências

- `lib/prisma.ts` — `Ficha`, `FichaPericia`, `FichaEntrada`, `Pericia`, `ClasseFormula`, `ProgressaoClasse`, `MembroSala`.
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `buscarSalaOuFalhar` (acesso de membro e sistema da sala).
- `engine/calculoFicha.ts` — `calcularFicha` (PV/PE/San máximos) e `montarTestesPericias`.
- `engine/pericias.ts` — `PERICIAS_OP1`, catálogo das 28 perícias com atributo-base.
- `engine/progressaoClasse.ts` — `habilidadesAcumuladas` (habilidades até o NEX atual).
- `sockets/emissor.ts` — `emitirParaSala` para `ficha:atualizada`.
- `middlewares/auth.ts` — `autenticar` no router.

## Testes

Sem testes automatizados próprios; o motor que ele usa é coberto por `engine/calculoFicha.test.ts` (`calcularFicha`) e `engine/progressaoOP1.test.ts` (`habilidadesAcumuladas` sobre a progressão do seed).
