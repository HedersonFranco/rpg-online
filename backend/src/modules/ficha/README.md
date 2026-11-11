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
| DELETE | `/fichas/:id` | dono da ficha ou mestre | Apaga o agente (204): perícias e entradas vão em cascata e os tokens dele saem dos mapas. `403`; `404` se não existe, não é membro ou já foi apagado. |
| POST | `/fichas/:id/pericias` | dono da ficha ou mestre | Define o grau `{ nome, nivel }` de uma perícia (upsert). `400` nível inválido; `403`; `404` perícia inexistente. |
| POST | `/fichas/:id/entradas` | dono da ficha ou mestre | Cria entrada (201), devolve `{ ficha }`. `400`; `403`. |
| PATCH | `/fichas/:id/entradas/:entradaId` | dono da ficha ou mestre | Edita entrada, devolve `{ ficha }`. `400`; `403`; `404` entrada não é desta ficha. |
| DELETE | `/fichas/:id/entradas/:entradaId` | dono da ficha ou mestre | Apaga entrada, devolve `{ ficha }`. `403`; `404`. |
| PUT | `/fichas/:id/avatar` | dono da ficha ou mestre | Troca a foto (multipart, campo `imagem`, PNG/JPEG/WebP até 2MB), devolve `{ ficha }`. `400` sem arquivo ou tipo errado; `403` antes de receber o arquivo; `413` acima de 2MB. |
| DELETE | `/fichas/:id/avatar` | dono da ficha ou mestre | Tira a foto, devolve `{ ficha }`. `403`; `404`. |

## Regras

- **Limites (05/11/2026):** 40 agentes por mesa e 100 entradas por ficha (rituais, habilidades, poderes e equipamentos somados) — a ficha inteira vai para a mesa a cada mudança, e 100 entradas no tamanho máximo já são ~440 KB por clique. Transação com trava (`criarNoLimite`); acima → `400`.
- Só salas `ORDEM_PARANORMAL_1` aceitam ficha por aqui; sala OP2 recebe `400`.
- Criação: `nome`, `origem` e `trilha` obrigatórios (não vazios); `for/agi/int/vig/pre` inteiros ≥ 0; `nex` padrão 5. No PATCH, campo ausente não é alterado.
- `classe` precisa ser COMBATENTE, ESPECIALISTA ou OCULTISTA e `nex` um dos 20 degraus (5, 10, …, 95, 99) — senão `400` com o motivo (`motivoClasseNexInvalidos()` em `engine/progressaoClasse.ts`), na criação e no PATCH que recalcula.
- Qualquer membro da sala lê qualquer ficha dela; não-membro recebe `404`.
- Edição: permitida se `ficha.usuario_id` é o usuário, ou se ele tem papel `MESTRE` na sala; senão `403`.
- Apagar (`removerFicha`): mesma permissão de editar. Os tokens da ficha são apagados na mesma transação — o schema tem `onDelete: SetNull`, e sem isso o token ficaria sem nome nem vínculo. Se o agente estiver num combate em andamento, ele segue na fila até o mestre encerrar (o combate é efêmero e guarda o nome). Dono e mestre apagando ao mesmo tempo: o segundo recebe `404`, não `500`.
- `pv_atual` e `san_atual`: inteiros de 0 a 999 — **podem passar do máximo** (há habilidades que concedem isso; decisão de 30/09/2026). `pe_atual`: inteiro de 0 ao máximo (já recalculado). Fora disso, `400`.
- Se o PE máximo cair (NEX/atributo menor) e o PATCH não mandar `pe_atual`, o atual desce para o novo máximo (antes, baixar o NEX com PE cheio dava `400`).
- Rolagem a partir da ficha (usada pelo socket): `montarTesteDaFicha()` (perícia/atributo; dono ou mestre, `400` para teste inexistente), `montarRolagemDeArma()` (ataque, dano ou crítico de uma arma da ficha; mesma permissão, `400` se a entrada não é arma) e `montarIniciativas()` (perícia Iniciativa de cada ficha pedida, só desta sala). Quem rola de fato é `engine/rolagem.ts`.
- `defesa_bonus`: inteiro de −50 a 50 (modificadores de equipamento/habilidades/condições, informados pelo jogador). Toda ficha devolvida traz `defesa: { defesa, esquiva, bloqueio }` (via `calcularDefesa`): Defesa = 10 + Agi + bônus; Esquiva = Defesa + bônus de Reflexos e Bloqueio = RD igual ao bônus de Fortitude, `null` sem treino (livro p. 42 e p. 87).
- `pv/pe/san_maximo_cache` são gravados a partir de `calcularFicha()`; nunca vêm do cliente.
- `inventario`: texto de até 10.000 caracteres.
- **Avatar (RNF10, 10/11/2026):** só entra pelo `PUT /fichas/:id/avatar` — criação e PATCH ignoram `avatarUrl`. Cada avatar é um arquivo só desta ficha (UUID novo a cada envio), então trocar, tirar ou apagar a ficha apaga o arquivo antigo do disco sem risco de levar a imagem de um mapa ou de outra ficha (se o PATCH aceitasse uma URL de `/uploads`, bastaria apontar para o mapa e depois tirar a foto). Também não há URL externa: num `<img>`, ela entregaria o IP de cada pessoa da mesa a um servidor de terceiros. A permissão é conferida antes do upload (quem não pode não chega a mandar o arquivo para a memória); o tipo é detectado pelos bytes.
- Graus de perícia: `DESTREINADO`, `TREINADO`, `VETERANO`, `EXPERT`. Perícia sem linha em `FichaPericia` sai como Destreinado.
- Toda ficha devolvida traz `testesPericias` (as 28 de `PERICIAS_OP1`, via `montarTestesPericias`) e `habilidadesDesbloqueadas` (via `habilidadesAcumuladas` sobre `ProgressaoClasse`).
- Entradas (`FichaEntrada`):
  - Tipos `RITUAL`, `HABILIDADE`, `PODER`, `EQUIPAMENTO`; campo específico de outro tipo é rejeitado com `400`.
  - Nome obrigatório até 100 caracteres; descrição até 4.000.
  - Ritual: `circulo` 1–4 e `elemento` em `SANGUE/MORTE/CONHECIMENTO/ENERGIA/MEDO/VARIA`.
  - Poder: `preRequisito` opcional até 200 caracteres.
  - Equipamento: `categoria` 0–4 e `espacos` 0–99.
  - Arma (equipamento com `tipoArma` em `CORPO_A_CORPO/ARREMESSO/DISPARO/FOGO`; decisão de 05/11/2026): `dano` obrigatório e `danoExtra` opcional, expressões que o painel de rolagem aceitaria (até 60 caracteres); `bonusAtaque` −50 a 50 (padrão 0), `margemAmeaca` 2–20 (padrão 20), `multiplicadorCritico` 2–10 (padrão 2). Campo de arma sem `tipoArma` → `400`; com a Força atual, dano e crítico precisam caber no que se pode rolar (até 50 dados — "20d6 ×3" → `400`). PATCH com `tipoArma: null` deixa de ser arma e limpa o resto (mandar um campo de arma junto → `400`). Toda entrada devolvida traz `arma` (`calcularArma()` em `engine/arma.ts`) ou `null`.
  - O tipo não pode mudar depois de criado (`400`). Na edição, a validação vale para o estado final (gravado + enviado).
  - `favorito` (qualquer tipo): `true`/`false`, senão `400`; ausente no PATCH = mantém. A aba Favoritos da ficha lista as marcadas.
- Tempo real: criar/editar ficha, trocar/tirar a foto, treinar perícia e criar/editar/apagar entrada emitem `emitirParaSala(salaId, 'ficha:atualizada', { ficha })` depois de gravar. Apagar a ficha emite `token:removido` (um por token dela) e `ficha:removida` `{ fichaId }`.

## Dependências

- `lib/prisma.ts` — `Ficha`, `FichaPericia`, `FichaEntrada`, `Pericia`, `ClasseFormula`, `ProgressaoClasse`, `MembroSala`, `Token` (ao apagar a ficha).
- `errors/AppError.ts` — erros com status HTTP.
- `modules/sala/sala.service.ts` — `buscarSalaOuFalhar` (acesso de membro e sistema da sala).
- `lib/armazenamento.ts` — `salvarImagemEnviada` e `removerArquivo` (avatar); `middlewares/upload.ts` — `uploadAvatar` (2MB).
- `engine/calculoFicha.ts` — `calcularFicha` (PV/PE/San máximos) e `montarTestesPericias`.
- `engine/arma.ts` — `calcularArma` (ataque, dano, crítico); `engine/rolagem.ts` — `lerExpressao` para validar o dano.
- `engine/pericias.ts` — `PERICIAS_OP1`, catálogo das 28 perícias com atributo-base.
- `engine/progressaoClasse.ts` — `habilidadesAcumuladas` (habilidades até o NEX atual).
- `sockets/emissor.ts` — `emitirParaSala` para `ficha:atualizada`.
- `middlewares/auth.ts` — `autenticar` no router.

## Testes

Sem testes automatizados próprios; o motor que ele usa é coberto por `engine/calculoFicha.test.ts` (`calcularFicha`) e `engine/progressaoOP1.test.ts` (`habilidadesAcumuladas` sobre a progressão do seed). O `DELETE` foi conferido em 21/10/2026 pela API (`403` do jogador na ficha do mestre, `401`, `204`, `404` ao repetir, token do agente apagado e o de outro objeto mantido, cascata de perícias/entradas) e no navegador com duas abas (card e token somem da outra aba ao vivo). As armas (05/11/2026): `engine/arma.test.ts` (8 testes, inclusive o exemplo do livro 1d8+3 → 2d8+3); pela API e pelo socket, 29 verificações (cálculo, as recusas `400`, `403`, dados vindos do banco, segredo do mestre, ameaça de crítico em 60 ataques); pela tela, 12 verificações com duas contas no Firefox 159 e o painel em 320px. A foto (10/11/2026): 27 verificações pela API e pelo socket, junto com o NPC (`401`, `403` antes do arquivo, `413`, `400` para HTML e sem arquivo, PATCH com `avatarUrl` ignorado, arquivo antigo apagado ao trocar/tirar/apagar ficha e mesa, mapa intacto); no navegador (build de produção): enviar, token mudando ao vivo, × com confirmação, 3MB recusado sem enviar.
