import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecurso } from '../../hooks/useRecurso'
import { api, mensagemDeErro } from '../../services/api'
import type { Banimento, Membro, Papel, SalaDetalhe, Usuario } from '../../services/tipos'
import { Alerta, Carregando } from '../ui/Feedback'
import { CarimboPapel, Folha } from '../ui/arquivo'
import { useConfirmar } from '../ui/confirmacaoContext'
import { classeBotaoArquivo, classeBotaoContorno, classeSelect, classeTituloArquivo, condensado } from '../ui/estilosArquivo'

const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const classeAcao = `${classeBotaoContorno} min-h-9 px-3 text-xs`

// Só o dono vê e usa: trocar papel, expulsar, banir e desbanir. As fichas de quem sai ficam na mesa.
export function PainelMembros({ sala, usuario }: { sala: SalaDetalhe; usuario: Usuario }) {
  const banidos = useRecurso<Banimento[]>(`/salas/${sala.id}/banidos`)
  const confirmar = useConfirmar()
  const navigate = useNavigate()
  const [pendente, setPendente] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function executar(chave: string, acao: () => Promise<unknown>) {
    setErro(null)
    setPendente(chave)
    try {
      await acao()
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setPendente(null)
    }
  }

  // A lista de membros vem da mesa (atualizada ao vivo por 'sala:membros'); aqui só se pede a mudança.
  const trocarPapel = (membro: Membro, papel: Papel) =>
    executar(membro.id, () => api(`/salas/${sala.id}/membros/${membro.id}`, { method: 'PATCH', body: { papel } }))

  async function remover(membro: Membro, banir: boolean) {
    const nome = membro.usuario.nome
    const ok = await confirmar(banir
      ? {
          titulo: `Banir ${nome}?`,
          mensagem: `${nome} sai da mesa agora e não consegue voltar por nenhum convite, até você desbanir. As fichas continuam na mesa.`,
          confirmar: 'Banir da mesa',
        }
      : {
          titulo: `Expulsar ${nome}?`,
          mensagem: `${nome} sai da mesa agora. Pode voltar se receber um convite válido; para impedir, use "Banir". As fichas continuam na mesa.`,
          confirmar: 'Expulsar da mesa',
        })
    if (!ok) return
    await executar(membro.id, async () => {
      await api(`/salas/${sala.id}/membros/${membro.id}${banir ? '?banir=1' : ''}`, { method: 'DELETE' })
      if (banir) banidos.revalidar()
    })
  }

  async function apagarMesa() {
    const ok = await confirmar({
      titulo: `Apagar "${sala.nome}"?`,
      mensagem: 'A mesa some para todo mundo, com todas as fichas, NPCs, mapas, tokens e mensagens. Quem estiver nela agora é tirado da mesa. Isso não pode ser desfeito.',
      confirmar: 'Apagar mesa',
    })
    if (!ok) return
    await executar('apagar-mesa', async () => {
      await api(`/salas/${sala.id}`, { method: 'DELETE' })
      navigate('/salas', { replace: true, state: { aviso: `A mesa "${sala.nome}" foi apagada.` } })
    })
  }

  const desbanir = (b: Banimento) =>
    executar(b.id, async () => {
      await api(`/salas/${sala.id}/banidos/${b.usuarioId}`, { method: 'DELETE' })
      banidos.atualizar((lista) => lista.filter((x) => x.id !== b.id))
    })

  return (
    <div className="space-y-8">
      <div>
        <h3 className={`text-2xl leading-none ${classeTituloArquivo}`}>
          Membros <span className="font-arquivo text-base font-normal tracking-normal text-grafite-300 normal-case [font-stretch:100%]">{sala.membros.length}</span>
        </h3>
        <p className="mt-2 text-sm text-grafite-300">Só você, dono da mesa, vê esta lista. As fichas de quem sai continuam na mesa.</p>
      </div>

      {erro && <Alerta tom="arquivo" mensagem={erro} />}

      <Folha className="p-4 sm:p-4">
        <ul className="divide-y divide-papel-300">
          {sala.membros.map((membro) => {
            const dono = membro.usuarioId === sala.donoId
            return (
              <li key={membro.id} className="space-y-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0">
                    <span className={`block truncate text-lg leading-tight font-extrabold ${condensado}`}>{membro.usuario.nome}</span>
                    <span className="text-xs text-tinta-700">
                      {dono ? (membro.usuarioId === usuario.id ? 'Você · dono da mesa' : 'Dono da mesa') : membro.usuarioId === usuario.id ? 'Você' : ' '}
                    </span>
                  </p>
                  <CarimboPapel papel={membro.papel} />
                </div>
                {!dono && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-32">
                      <label htmlFor={`papel-${membro.id}`} className="sr-only">Papel de {membro.usuario.nome}</label>
                      <select id={`papel-${membro.id}`} value={membro.papel} disabled={pendente !== null}
                        onChange={(e) => trocarPapel(membro, e.target.value as Papel)} className={`${classeSelect(false)} py-1 text-sm`}>
                        <option value="JOGADOR">Jogador</option>
                        <option value="MESTRE">Mestre</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => remover(membro, false)} disabled={pendente !== null} className={classeAcao}>Expulsar</button>
                    <button type="button" onClick={() => remover(membro, true)} disabled={pendente !== null} className={classeAcao}>Banir</button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Folha>

      <section aria-labelledby="titulo-banidos">
        <h4 id="titulo-banidos" className={`text-xl leading-none ${classeTituloArquivo}`}>Banidos</h4>
        {banidos.estado.tipo === 'carregando' && <Carregando texto="Carregando banidos..." />}
        {banidos.estado.tipo === 'erro' && (
          <div className="mt-3"><Alerta tom="arquivo" mensagem={banidos.estado.mensagem} onTentarNovamente={banidos.recarregar} /></div>
        )}
        {banidos.estado.tipo === 'ok' && banidos.estado.dados.length === 0 && (
          <p className="mt-3 text-sm text-grafite-300">Ninguém banido desta mesa.</p>
        )}
        {banidos.estado.tipo === 'ok' && banidos.estado.dados.length > 0 && (
          <Folha className="mt-3 p-4 sm:p-4">
            <ul className="divide-y divide-papel-300">
              {banidos.estado.dados.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <p className="min-w-0">
                    <span className={`block truncate text-base leading-tight font-extrabold ${condensado}`}>{b.usuario.nome}</span>
                    <span className="text-xs text-tinta-700">Banimento em <span className="font-datilo text-tinta-900">{formatoData.format(new Date(b.createdAt))}</span></span>
                  </p>
                  <button type="button" onClick={() => desbanir(b)} disabled={pendente !== null} className={classeAcao}>Desbanir</button>
                </li>
              ))}
            </ul>
          </Folha>
        )}
      </section>

      <section aria-labelledby="titulo-apagar" className="border-t border-arquivo-700 pt-6">
        <h4 id="titulo-apagar" className={`text-xl leading-none ${classeTituloArquivo}`}>Apagar esta mesa</h4>
        <p className="mt-2 text-sm text-grafite-300">Apaga a mesa para todos, com fichas, NPCs, mapas e mensagens. Não tem volta.</p>
        <button type="button" onClick={apagarMesa} disabled={pendente !== null} className={`${classeBotaoArquivo} mt-4`}>
          Apagar mesa
        </button>
      </section>
    </div>
  )
}
