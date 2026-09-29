import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { Carimbo, Folha, PlacaGaveta } from '../../components/ui/arquivo'
import {
  classeBotaoArquivo,
  classeBotaoContorno,
  classeBotaoKraft,
  classeBotaoTinta,
  classeLinkArquivo,
  classeTituloArquivo,
  condensado,
} from '../../components/ui/estilosArquivo'

// Página de apresentação (pública). Imagens: capturas da própria mesa com dados inventados e a planta
// desenhada para a demonstração (docs/demo) — a Licença da Comunidade proíbe arte e nomes do cânone.

const AVISO_LICENCA = 'Este é um conteúdo não oficial, publicado sob a Licença da Comunidade de Ordem Paranormal'

const ETAPAS: { numero: string; carimbo: string; titulo: string; texto: string; imagem: string; alt: string; largura: number; altura: number }[] = [
  {
    numero: '01',
    carimbo: 'Convite',
    titulo: 'O mestre manda o link',
    texto: 'Crie a mesa, escolha a edição — Ordem Paranormal RPG ou RPG II (playtest) — e mande o convite. O link vale 7 dias, e quem clica já entra direto na mesa.',
    imagem: '/apresentacao/etapa-convite.jpg',
    alt: 'Lista de mesas com a pasta "O Casarão da Rua Onze" e a folha "Entrar com convite" preenchida com o link',
    largura: 1040,
    altura: 740,
  },
  {
    numero: '02',
    carimbo: 'Ficha',
    titulo: 'Cada um monta a sua ficha',
    texto: 'NEX, classe, atributos, perícias, rituais e equipamentos. Vida, Esforço e Sanidade saem calculados pelo servidor, com a fórmula do livro — ninguém erra a conta, e a mesa inteira vê a mudança na hora.',
    imagem: '/apresentacao/etapa-ficha.jpg',
    alt: 'Ficha de Helena Duarte, ocultista com NEX 40%: círculo de atributos e barras de Vida 17/27, Sanidade 38/55 e Esforço 35/35',
    largura: 380,
    altura: 740,
  },
  {
    numero: '03',
    carimbo: 'Mapa',
    titulo: 'O mapa ganha vida',
    texto: 'Suba a planta, coloque os tokens e arraste: todos veem o movimento ao mesmo tempo. Câmera e microfone são opcionais — sem vídeo, a mesa segue em texto e mapa.',
    imagem: '/apresentacao/etapa-mapa.jpg',
    alt: 'Planta baixa de um casarão com os tokens de três agentes na sala de estar e na cozinha e o de um NPC sobre o alçapão',
    largura: 988,
    altura: 748,
  },
  {
    numero: '04',
    carimbo: 'Combate',
    titulo: 'Rola iniciativa',
    texto: 'O mestre informa a iniciativa e a régua mostra de quem é a vez e quem vem depois. Os dados são rolados no servidor: ninguém escolhe o resultado.',
    imagem: '/apresentacao/etapa-combate.jpg',
    alt: 'Mesa em combate: tokens na planta do casarão e a régua de turno com a vez de Marta Sá, iniciativa 19, e o botão Encerrar turno',
    largura: 988,
    altura: 700,
  },
]

const PUBLICOS = [
  {
    titulo: 'Grupos de amigos em campanha',
    texto: 'Para a mesa que se encontra toda semana: fichas que ficam salvas, mapas preparados pelo mestre, a campanha inteira no mesmo lugar.',
  },
  {
    titulo: 'Mesas abertas',
    texto: 'Para a one-shot com gente nova: quem recebe o link entra, monta a ficha e joga, sem instalar nada.',
  },
  {
    titulo: 'As duas edições',
    texto: 'Cada mesa escolhe Ordem Paranormal RPG ou RPG II (playtest). A ficha de RPG II chega quando o playtest publicar a criação de personagem.',
  },
]

// Recorte da interface: uma foto impressa presa numa folha do dossiê, com o carimbo da etapa.
function Recorte({ src, alt, largura, altura, carimbo }: { src: string; alt: string; largura: number; altura: number; carimbo: string }) {
  return (
    <figure className="relative">
      <Folha className="p-3 sm:p-4">
        <img src={src} alt={alt} width={largura} height={altura} loading="lazy" decoding="async"
          className="h-auto w-full rounded-[2px] bg-arquivo-800 shadow-[0_2px_4px_rgb(0_0_0/0.35)]" />
      </Folha>
      <span className="absolute -top-4 -right-2 sm:-right-4">
        <span className="inline-block rounded-[3px] bg-papel-100 p-1 shadow-[0_4px_10px_-6px_rgb(0_0_0/0.9)]">
          <Carimbo>{carimbo}</Carimbo>
        </span>
      </span>
    </figure>
  )
}

// Selo oficial da Licença da Comunidade (kit oficial, versão branca para fundo escuro).
// A licença exige 100% de opacidade e largura mínima de 10% da "capa": nada de filtro, transparência ou sobreposição.
function SeloLicenca({ className = '' }: { className?: string }) {
  return (
    <img src="/licenca/selo-branco-480.png" width={480} height={474} loading="lazy" decoding="async"
      alt="Selo da Licença da Comunidade de Ordem Paranormal: não oficial, não canônico"
      className={`block h-auto ${className}`} />
  )
}

function Chamadas({ logado, tamanho = 'normal' }: { logado: boolean; tamanho?: 'normal' | 'grande' }) {
  const grande = tamanho === 'grande' ? 'min-h-12 px-6 text-base' : ''
  if (logado) {
    return <Link to="/salas" className={`${classeBotaoKraft} ${grande}`}>Ir para suas mesas</Link>
  }
  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/cadastro" className={`${classeBotaoKraft} ${grande}`}>Criar conta</Link>
      <Link to="/login" className={`${classeBotaoArquivo} ${grande}`}>Entrar</Link>
    </div>
  )
}

function Secao({ id, titulo, children }: { id?: string; titulo: string; children: ReactNode }) {
  const idTitulo = `${id ?? titulo}-titulo`
  return (
    <section id={id} aria-labelledby={idTitulo} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28">
      <h2 id={idTitulo} className={`mb-12 text-4xl leading-none sm:text-6xl ${classeTituloArquivo}`}>{titulo}</h2>
      {children}
    </section>
  )
}

export function Apresentacao() {
  const { estado } = useAuth()
  const logado = estado.status === 'autenticado'

  return (
    <div className="mundo-arquivo">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-arquivo-700 bg-arquivo-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <PlacaGaveta />
          <nav aria-label="Principal" className="flex items-center gap-4">
            <a href="#como-funciona" className={`hidden text-sm sm:inline ${classeLinkArquivo}`}>Como funciona</a>
            {logado ? (
              <Link to="/salas" className={classeBotaoArquivo}>Suas mesas</Link>
            ) : (
              <Link to="/login" className={classeBotaoArquivo}>Entrar</Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Capa: a própria mesa em uso, escurecida à esquerda onde fica o texto. */}
        <section aria-labelledby="titulo-capa" className="relative isolate flex min-h-[92vh] items-end overflow-hidden pt-20 sm:items-center">
          <img src="/apresentacao/mesa.jpg" alt="" width={1440} height={900} fetchPriority="high"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_30%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-arquivo-950/85 sm:bg-transparent sm:bg-[linear-gradient(90deg,var(--color-arquivo-950)_0%,rgb(14_15_16/0.95)_45%,rgb(14_15_16/0.6)_72%,rgb(14_15_16/0.4)_100%)]" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[linear-gradient(0deg,var(--color-arquivo-900),transparent)]" />
          <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:pb-0">
            <div className="max-w-xl">
              <h1 id="titulo-capa" className={`text-6xl leading-[0.9] text-grafite-100 sm:text-8xl ${classeTituloArquivo}`}>
                A sessão inteira numa aba só.
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-grafite-300">
                Vídeo, mapa com tokens, ficha calculada, chat, rolagem e turno: uma mesa virtual feita para Ordem Paranormal RPG.
              </p>
              <div className="mt-8">
                <Chamadas logado={logado} tamanho="grande" />
              </div>
            </div>
            <div className="mt-16 sm:absolute sm:right-6 sm:bottom-8 sm:mt-0">
              <SeloLicenca className="w-[max(10vw,112px)]" />
            </div>
          </div>
        </section>

        <Secao id="como-funciona" titulo="Uma noite de jogo">
          <ol className="space-y-24 sm:space-y-32">
            {ETAPAS.map((etapa, i) => (
              <li key={etapa.numero} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                <div className={`md:col-span-5 ${i % 2 === 1 ? 'md:order-2 md:col-start-8' : ''}`}>
                  <h3 className={`text-3xl leading-none sm:text-4xl ${classeTituloArquivo}`}>{etapa.titulo}</h3>
                  <p className="mt-4 max-w-prose text-base leading-relaxed text-grafite-300">{etapa.texto}</p>
                </div>
                <div className={`${etapa.largura < 500 ? 'mx-auto w-full max-w-xs md:col-span-4 md:col-start-8' : 'md:col-span-7'} ${i % 2 === 1 ? 'md:order-1 md:col-start-1' : ''}`}>
                  <Recorte src={etapa.imagem} alt={etapa.alt} largura={etapa.largura} altura={etapa.altura} carimbo={etapa.carimbo} />
                </div>
              </li>
            ))}
          </ol>
        </Secao>

        <section aria-labelledby="titulo-porque" className="border-y border-arquivo-700 bg-arquivo-950">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:py-28 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 id="titulo-porque" className={`text-4xl leading-none sm:text-6xl ${classeTituloArquivo}`}>Por que existe</h2>
              {/* As três ferramentas que a mesa tinha abertas, e a uma que as substitui. */}
              <div aria-hidden="true" className="mt-10 space-y-2">
                {['Chamada de voz', 'Site de rolar dados', 'Mapa interativo'].map((nome) => (
                  <p key={nome} className={`w-fit rounded-t-[4px] border border-b-0 border-arquivo-600 px-4 py-2 text-sm font-bold tracking-[0.1em] text-grafite-400 uppercase line-through decoration-carimbo-300 decoration-2 ${condensado}`}>
                    {nome}
                  </p>
                ))}
                <p className={`textura-fibra mt-4 w-fit rounded-t-[4px] bg-kraft-500 px-4 py-2 text-sm font-bold tracking-[0.1em] text-tinta-900 uppercase ${condensado}`}>
                  RPG Online
                </p>
              </div>
            </div>
            <blockquote className="md:col-span-7 md:pt-2">
              <p className="text-2xl leading-snug text-grafite-100 sm:text-3xl">
                A minha mesa jogava com três abas abertas: uma para a chamada de voz, um site que rolava os dados e outro com o mapa interativo.
                Toda sessão alguém se perdia entre elas.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-grafite-300">
                O RPG Online nasceu para juntar as três numa só: a mesa, a ficha e as pessoas no mesmo lugar, do convite ao fim do combate.
              </p>
              <footer className={`mt-8 text-sm font-bold tracking-[0.12em] text-kraft-300 uppercase ${condensado}`}>
                Hederson Franco, criador
              </footer>
            </blockquote>
          </div>
        </section>

        <Secao titulo="Para quem">
          <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {PUBLICOS.map((p) => (
              <li key={p.titulo} className="border-t-2 border-kraft-600 pt-6">
                <h3 className={`text-2xl leading-tight ${classeTituloArquivo}`}>{p.titulo}</h3>
                <p className="mt-3 text-base leading-relaxed text-grafite-300">{p.texto}</p>
              </li>
            ))}
          </ul>
        </Secao>

        <section aria-labelledby="titulo-fim" className="mx-auto max-w-3xl px-4 pb-24">
          <Folha className="p-8 sm:p-12">
            <h2 id="titulo-fim" className={`text-4xl leading-none sm:text-5xl ${classeTituloArquivo}`}>Monte a sua mesa</h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-tinta-700">
              Crie a conta, abra uma mesa e mande o link para o seu grupo. A próxima sessão já pode ser aqui.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {logado ? (
                <Link to="/salas" className={classeBotaoTinta}>Ir para suas mesas</Link>
              ) : (
                <>
                  <Link to="/cadastro" className={classeBotaoTinta}>Criar conta</Link>
                  <Link to="/login" className={classeBotaoContorno}>Entrar</Link>
                </>
              )}
            </div>
          </Folha>
        </section>
      </main>

      <footer className="border-t border-arquivo-700 bg-arquivo-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-2 text-sm text-grafite-300">
            <p className="text-grafite-100">{AVISO_LICENCA}.</p>
            <p>Projeto de fã, sem vínculo com a Jambô Editora nem com os criadores de Ordem Paranormal.</p>
            <p>© 2026 Hederson Franco. Código fechado — todos os direitos reservados.</p>
          </div>
          <SeloLicenca className="w-24 shrink-0" />
        </div>
      </footer>
    </div>
  )
}
