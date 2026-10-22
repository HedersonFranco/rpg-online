# Módulo montaria

Montarias da mesa (carro, cavalo, skate...): uma biblioteca de imagens que qualquer membro salva e põe no mapa como token. O token de montaria fica sempre por baixo dos outros (o de quem monta vai por cima) e muda de tamanho pela alça do canto, como no Owlbear.

## Rotas

Listagem e criação ficam em `sala.routes.ts`; o resto em `/montarias` (`server.ts`). Todas exigem autenticação.

| Método | Caminho | Quem pode | O que faz |
|---|---|---|---|
| GET | `/salas/:id/montarias` | membro da sala | Lista as montarias da mesa, com quem salvou (`usuario: { id, nome }`). |
| POST | `/salas/:id/montarias` | membro da sala | Upload multipart (`imagem` + `nome`) → montaria (201). `400` sem nome (até 60 caracteres), sem arquivo ou formato não suportado; `413` acima de 2MB. |
| DELETE | `/montarias/:id` | quem salvou ou mestre | Apaga a montaria (204); os tokens dela saem dos mapas e a imagem sai do disco. `403`; `404` se não existe ou já foi apagada. |
| POST | `/montarias/:id/token` | membro da sala | Põe a montaria no mapa ativo da mesa em `x`,`y` (201, devolve o token). `400` sem mapa na mesa ou coordenada inválida. |

Não-membro recebe `404` (via `buscarSalaOuFalhar`).

## Regras

- Upload: `exigirMembro` roda **antes** do `multer` — quem não é da mesa nem chega a mandar o arquivo para a memória. O `multer` (`uploadImagemMontaria`) limita a 2MB, 1 arquivo, 5 campos de até 1KB; acima de 2MB → `413` com mensagem de montaria.
- Tipo da imagem pelos bytes (`detectarTipoImagem`): só PNG, JPEG ou WebP. Fundo transparente fica melhor embaixo do token.
- Apagar: só quem salvou (`Montaria.usuarioId`) ou um mestre da mesa. `deleteMany` + contagem: dois pedidos ao mesmo tempo dão `404` ao segundo, não `500`.
- O token de montaria (`Token.montariaId`, `onDelete: Cascade`) segue as regras de `mapa.service.ts`: qualquer membro move, redimensiona (`Token.escala`, de 0,25 a 10) e tira do mapa. No banco, um token tem no máximo um vínculo — ficha, NPC ou montaria (CHECK `token_um_vinculo`).
- Apagar a mesa apaga as montarias (cascata) e `deletarSala` remove as imagens do disco.
- Tempo real (`emitirParaSala`): `montaria:criada { montaria }`, `montaria:removida { montariaId }`; pôr no mapa emite `token:criado`, e apagar emite `token:removido` para cada token dela.

## Dependências

- `lib/prisma.ts` — `Montaria`, `Token`.
- `errors/AppError.ts` — erros com status HTTP.
- `lib/armazenamento.ts` — `detectarTipoImagem`, `salvarArquivo`, `removerArquivo`.
- `modules/sala/sala.service.ts` — `buscarSalaOuFalhar` (acesso de membro, mestre e mapa ativo).
- `modules/mapa/mapa.service.ts` — `coordenadaValida`, `INCLUIR_DADOS_TOKEN`.
- `sockets/emissor.ts` — `emitirParaSala`.
- `middlewares/auth.ts` — `autenticar`; `middlewares/upload.ts` — `uploadImagemMontaria` (em `sala.routes.ts`).

## Testes

Sem testes automatizados próprios. Conferido em 22/10/2026 pela API (18 verificações: criar como membro, `404` para quem é de fora antes do upload, `413` acima de 2MB, `400` para HTML disfarçado e sem nome, pôr no mapa com e sem mapa ativo, CHECK do banco, tirar do mapa, `403` para apagar a de outro, apagar levando tokens e imagem, `404` ao repetir) e no navegador com duas abas (salvar, pôr no mapa, ficar por baixo do token, mover, alça e botões de tamanho, remover e apagar ao vivo).
