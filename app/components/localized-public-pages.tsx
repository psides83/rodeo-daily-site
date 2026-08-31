import Image from "next/image";
import Link from "next/link";
import { RodeoDailyLogoMark } from "./rodeo-views";
import { absoluteUrl } from "../lib/seo";

export type CountryLocale = "br" | "mx";

type HelpSection = {
  title: string;
  body: readonly string[];
  link?: {
    href: string;
    label: string;
  };
};

const appStoreUrl = "https://apps.apple.com/us/app/rodeo-daily/id1671624492";
const contactEmail = "thewaymediaco@gmail.com";

export const localizedRoutes = {
  br: {
    language: "pt-BR",
    label: "Brasil",
    prefix: "/br",
    privacy: "/br/privacy",
    support: "/br/support",
    marketing: "/br/ios-app"
  },
  mx: {
    language: "es-MX",
    label: "Mexico",
    prefix: "/mx",
    privacy: "/mx/privacy",
    support: "/mx/support",
    marketing: "/mx/ios-app"
  }
} as const;

const localizedContent = {
  br: {
    common: {
      app: "Abrir App",
      ios: "App para iOS",
      support: "Suporte",
      privacy: "Politica de Privacidade",
      webApp: "App Web",
      supportEmail: "Enviar Email ao Suporte",
      viewIosApp: "Ver App para iOS",
      contactSupport: "Falar com o Suporte",
      appStoreAlt: "Baixar na App Store"
    },
    privacy: {
      title: "Politica de Privacidade do Rodeo Daily",
      description:
        "Leia a politica de privacidade do Rodeo Daily para o app iOS, app web, PWA, publicidade, cookies, preferencias locais e fontes de dados de rodeio.",
      eyebrow: "Politica de Privacidade",
      intro:
        "Esta politica explica como o Rodeo Daily trata informacoes no app para iOS, no site e no Progressive Web App, incluindo publicidade, cookies, preferencias locais e fontes de dados de rodeio.",
      updated: "Data de vigencia: 28 de agosto de 2026",
      summary:
        "O Rodeo Daily nao exige conta para navegar por standings, resultados, calendarios, perfis de atletas ou daysheets. A maioria das preferencias fica salva no seu proprio dispositivo. Anuncios podem ser exibidos por servicos do Google, e voce pode gerenciar as escolhas de anuncios da web nas configuracoes de privacidade do app.",
      sections: [
        {
          title: "Informacoes Que o Rodeo Daily Coleta",
          body: [
            "O Rodeo Daily foi criado principalmente como um app informativo de rodeio. Voce pode consultar standings, resultados, calendarios, daysheets, perfis de atletas, campeoes anteriores e listas de rodeios sem criar uma conta.",
            "O app e o site podem coletar informacoes limitadas que voce fornece diretamente, como uma mensagem de email enviada ao suporte. O app tambem pode salvar preferencias no seu dispositivo, incluindo atletas favoritos, atletas seguidos, configuracoes de exibicao, escolhas de consentimento de anuncios e banners dispensados."
          ]
        },
        {
          title: "Informacoes Coletadas Automaticamente",
          body: [
            "Ao usar o site, informacoes tecnicas padrao podem ser processadas por sistemas de hospedagem, navegador, analise, publicidade ou seguranca. Isso pode incluir endereco IP, tipo de navegador, tipo de dispositivo, sistema operacional, paginas visualizadas, paginas de referencia, localizacao aproximada inferida pelo IP e dados de interacao.",
            "O app para iOS pode processar informacoes do dispositivo necessarias para operar recursos, medir desempenho, mostrar anuncios, diagnosticar problemas e melhorar a experiencia."
          ]
        },
        {
          title: "Cookies, Armazenamento Local e PWA",
          body: [
            "O site do Rodeo Daily usa armazenamento do navegador para lembrar escolhas no mesmo dispositivo, incluindo escolhas de privacidade, favoritos, atletas seguidos, listas compactas, tema e banners promocionais dispensados.",
            "Se voce instalar o Rodeo Daily como Progressive Web App, o navegador tambem pode armazenar arquivos do app em cache para abrir o site rapidamente. Voce pode limpar esses dados nas configuracoes do navegador, do site ou do dispositivo."
          ]
        },
        {
          title: "Publicidade",
          body: [
            "O Rodeo Daily pode exibir anuncios no app para iOS e no site. O Rodeo Daily pode usar servicos de publicidade do Google, incluindo Google AdMob no app iOS e Google AdSense no site.",
            "Provedores de publicidade podem usar cookies, identificadores de dispositivo, dados de uso e tecnologias semelhantes para exibir anuncios, medir desempenho, prevenir fraude, limitar frequencia e personalizar anuncios quando permitido."
          ]
        },
        {
          title: "Como as Informacoes Sao Usadas",
          body: [
            "O Rodeo Daily usa informacoes para oferecer recursos do app e do site, lembrar preferencias, mostrar conteudo de rodeio, manter favoritos, melhorar desempenho, resolver problemas, responder ao suporte, medir uso, exibir anuncios, cumprir obrigacoes legais e proteger o servico contra abuso.",
            "O Rodeo Daily nao vende informacoes pessoais diretamente a corretores de dados. Algumas praticas de publicidade podem ser consideradas compartilhamento ou publicidade direcionada sob certas leis de privacidade, dependendo da sua localizacao e das escolhas de anuncios."
          ]
        },
        {
          title: "Dados de Rodeio e Fontes de Terceiros",
          body: [
            "O Rodeo Daily exibe informacoes de rodeio como standings, resultados, calendarios, daysheets, perfis de atletas, rankings, ganhos, fotos e listas a partir de fontes de dados de rodeio de terceiros e fontes publicas.",
            "Esse conteudo pode incluir nomes de atletas, cidades de origem, fotos, ganhos, resultados, rankings e outras informacoes profissionais de rodeio. O Rodeo Daily usa essas informacoes para oferecer referencia, acompanhamento esportivo e recursos para fas."
          ]
        },
        {
          title: "Suas Escolhas",
          body: [
            "Voce pode gerenciar escolhas de consentimento de anuncios nas configuracoes de privacidade do app web Rodeo Daily. Tambem pode limpar o armazenamento local do navegador, bloquear cookies, limitar rastreamento de anuncios nas configuracoes do dispositivo ou usar controles oferecidos pela Apple, Google, navegador ou ferramentas de opt-out do setor.",
            "Excluir o app, limpar dados do navegador ou remover o PWA pode apagar preferencias locais como favoritos e banners dispensados."
          ]
        },
        {
          title: "Direitos de Privacidade",
          body: [
            "Dependendo de onde voce mora, pode ter direitos de privacidade como solicitar acesso, correcao, exclusao, portabilidade ou optar por sair de certas praticas de publicidade direcionada ou compartilhamento.",
            `Para fazer uma solicitacao de privacidade, entre em contato pelo email ${contactEmail}. O Rodeo Daily pode precisar verificar sua solicitacao antes de agir.`
          ]
        }
      ]
    },
    support: {
      title: "Suporte do Rodeo Daily",
      description:
        "Obtenha suporte para o Rodeo Daily no iOS, app web e PWA, incluindo standings PRCA e WPRA, resultados de rodeio, calendarios, perfis de atletas, anuncios e privacidade.",
      eyebrow: "Suporte",
      intro:
        "Receba ajuda com o app Rodeo Daily para iOS, app web, PWA, standings PRCA, standings WPRA, resultados de rodeio, calendarios, perfis de atletas, anuncios e configuracoes de privacidade.",
      contact:
        "Para suporte do app, relatorios de erro, pedidos de recursos ou duvidas sobre dados, envie um email para",
      sections: [
        {
          title: "Antes de Enviar Email",
          body: [
            "Inclua o dispositivo usado, a versao do app ou navegador, a pagina em que estava, o nome do rodeio ou atleta se houver, e uma captura de tela quando possivel.",
            "Para erros, o relato mais util explica o que voce esperava, o que aconteceu e quais passos causaram o problema."
          ]
        },
        {
          title: "Ajuda do App para iOS",
          body: [
            "Se o app para iPhone nao estiver mostrando standings, resultados ou calendarios recentes, verifique primeiro se ha atualizacao na App Store e depois feche e reabra completamente o Rodeo Daily.",
            "Favoritos, atletas seguidos, notificacoes e preferencias de exibicao podem ficar salvos no seu dispositivo. Excluir o app pode remover configuracoes locais."
          ]
        },
        {
          title: "Ajuda do App Web e PWA",
          body: [
            "Se voce instalou o Rodeo Daily com Adicionar a Tela de Inicio, o navegador pode armazenar arquivos em cache para abrir o PWA rapidamente. Recarregar a pagina ou remover e adicionar novamente o PWA pode ajudar depois de uma atualizacao.",
            "O site salva escolhas locais como favoritos, consentimento e banners dispensados no navegador. Limpar os dados do site pode redefinir essas escolhas."
          ]
        },
        {
          title: "Duvidas Sobre Dados de Rodeio",
          body: [
            "O Rodeo Daily exibe standings, resultados, calendarios, daysheets, perfis de atletas e informacoes relacionadas a partir da PRCA, WPRA e outras fontes de dados de rodeio.",
            "Se um resultado, ranking ou calendario estiver diferente de uma fonte oficial, isso pode ocorrer por tempo de atualizacao, correcoes ou atraso nos dados. Para inscricoes oficiais, pagamentos ou decisoes finais, fale com a associacao oficial ou com o escritorio do rodeio."
          ]
        },
        {
          title: "Anuncios e Privacidade",
          body: [
            "O Rodeo Daily pode mostrar anuncios no app iOS e no site. As escolhas de anuncios da web podem ser gerenciadas nas configuracoes do app neste site.",
            "Detalhes de privacidade, publicidade, armazenamento do navegador e escolhas do usuario estao na Politica de Privacidade."
          ],
          link: { href: "/br/privacy", label: "Ler a Politica de Privacidade" }
        }
      ]
    },
    marketing: {
      title: "Rodeo Daily para iPhone",
      description:
        "Baixe o Rodeo Daily para iPhone para acompanhar standings PRCA e WPRA, resultados de rodeio, calendarios, daysheets, perfis de atletas, favoritos e atualizacoes de rodeio.",
      eyebrow: "Rodeo Daily para iPhone",
      headline: "Acompanhe standings, resultados, calendarios e atletas de rodeio em um so app.",
      intro:
        "O Rodeo Daily reune standings PRCA, standings WPRA, resultados de rodeio, calendarios, daysheets, perfis de atletas, favoritos e ferramentas de referencia em uma experiencia rapida para iPhone.",
      builtFor: "Feito Para Fas de Rodeio",
      listTitle: "Tudo que voce consulta durante a temporada de rodeio, organizado para acesso rapido.",
      footerTitle: "Baixe o Rodeo Daily na App Store.",
      footerBody:
        "Use o Rodeo Daily no iPhone para a experiencia completa do app, ou abra o app web quando estiver em outro dispositivo.",
      features: [
        { title: "Standings", body: "Acompanhe standings PRCA e WPRA por temporada, evento, circuito e tipo." },
        { title: "Resultados", body: "Veja resultados, colocacoes por round, average, pagamentos e atualizacoes recentes." },
        { title: "Calendario", body: "Encontre proximos rodeios, datas, locais, daysheets e detalhes dos eventos." },
        { title: "Atletas", body: "Abra perfis com estatisticas, resultados, carreira, destaques e links de biografia." },
        { title: "Favoritos", body: "Mantenha atletas seguidos e informacoes importantes de rodeio sempre por perto." },
        { title: "Referencia", body: "Consulte NFR, campeoes anteriores, listas de rodeios e recursos uteis." }
      ],
      highlights: [
        "Standings mundiais e de circuito da PRCA",
        "Standings WPRA de barrel racing e breakaway",
        "Resultados de rodeio por round e average",
        "Calendarios, daysheets, detalhes e listas de rodeios",
        "Perfis de atletas com estatisticas, resultados, carreira, destaques e bio",
        "Favoritos e acesso rapido ao conteudo acompanhado"
      ]
    }
  },
  mx: {
    common: {
      app: "Abrir App",
      ios: "App para iOS",
      support: "Soporte",
      privacy: "Politica de Privacidad",
      webApp: "App Web",
      supportEmail: "Enviar Email a Soporte",
      viewIosApp: "Ver App para iOS",
      contactSupport: "Contactar Soporte",
      appStoreAlt: "Descargar en App Store"
    },
    privacy: {
      title: "Politica de Privacidad de Rodeo Daily",
      description:
        "Lee la politica de privacidad de Rodeo Daily para la app iOS, app web, PWA, publicidad, cookies, preferencias locales y fuentes de datos de rodeo.",
      eyebrow: "Politica de Privacidad",
      intro:
        "Esta politica explica como Rodeo Daily maneja informacion en la app para iOS, el sitio web y la Progressive Web App, incluyendo publicidad, cookies, preferencias locales y fuentes de datos de rodeo.",
      updated: "Fecha de vigencia: 28 de agosto de 2026",
      summary:
        "Rodeo Daily no requiere una cuenta para consultar standings, resultados, calendarios, perfiles de atletas o daysheets. La mayoria de las preferencias se guardan en tu propio dispositivo. Se pueden mostrar anuncios mediante servicios de Google, y puedes gestionar tus opciones de anuncios web en la configuracion de privacidad de la app.",
      sections: [
        {
          title: "Informacion Que Recopila Rodeo Daily",
          body: [
            "Rodeo Daily esta disenado principalmente como una app informativa de rodeo. Puedes consultar standings, resultados, calendarios, daysheets, perfiles de atletas, campeones anteriores y listados de rodeos sin crear una cuenta.",
            "La app y el sitio pueden recopilar informacion limitada que proporcionas directamente, como un mensaje de email si contactas a soporte. La app tambien puede guardar preferencias en tu dispositivo, incluyendo atletas favoritos, atletas seguidos, configuracion de visualizacion, consentimiento de anuncios y banners descartados."
          ]
        },
        {
          title: "Informacion Recopilada Automaticamente",
          body: [
            "Cuando usas el sitio, informacion tecnica estandar puede ser procesada por sistemas de hosting, navegador, analitica, publicidad o seguridad. Esto puede incluir direccion IP, tipo de navegador, tipo de dispositivo, sistema operativo, paginas vistas, paginas de referencia, ubicacion aproximada inferida por IP y datos de interaccion.",
            "La app de iOS puede procesar informacion del dispositivo necesaria para operar funciones, medir rendimiento, mostrar anuncios, diagnosticar problemas y mejorar la experiencia."
          ]
        },
        {
          title: "Cookies, Almacenamiento Local y PWA",
          body: [
            "El sitio de Rodeo Daily usa almacenamiento del navegador para recordar elecciones en el mismo dispositivo, incluyendo privacidad, favoritos, atletas seguidos, listas compactas, tema y banners promocionales descartados.",
            "Si instalas Rodeo Daily como Progressive Web App, tu navegador tambien puede cachear archivos de la app para abrir el sitio rapidamente. Puedes borrar estos datos desde la configuracion del navegador, del sitio o del dispositivo."
          ]
        },
        {
          title: "Publicidad",
          body: [
            "Rodeo Daily puede mostrar anuncios en la app de iOS y en el sitio web. Rodeo Daily puede usar servicios de publicidad de Google, incluyendo Google AdMob en la app iOS y Google AdSense en el sitio.",
            "Los proveedores de publicidad pueden usar cookies, identificadores de dispositivo, datos de uso y tecnologias similares para entregar anuncios, medir rendimiento, prevenir fraude, limitar frecuencia y personalizar anuncios cuando este permitido."
          ]
        },
        {
          title: "Como Se Usa la Informacion",
          body: [
            "Rodeo Daily usa informacion para ofrecer funciones de la app y el sitio, recordar preferencias, mostrar contenido de rodeo, mantener favoritos, mejorar rendimiento, solucionar problemas, responder solicitudes de soporte, medir uso, mostrar anuncios, cumplir obligaciones legales y proteger el servicio contra abuso.",
            "Rodeo Daily no vende informacion personal directamente a brokers de datos. Algunas practicas publicitarias pueden considerarse compartir informacion o publicidad dirigida bajo ciertas leyes de privacidad, dependiendo de tu ubicacion y opciones de anuncios."
          ]
        },
        {
          title: "Datos de Rodeo y Fuentes de Terceros",
          body: [
            "Rodeo Daily muestra informacion relacionada con rodeo, como standings, resultados, calendarios, daysheets, perfiles de atletas, rankings, ganancias, fotos y listados desde fuentes de datos de rodeo de terceros y fuentes publicas.",
            "Ese contenido puede incluir nombres de atletas, ciudades de origen, fotos, ganancias, resultados, rankings y otra informacion profesional de rodeo. Rodeo Daily usa esta informacion para ofrecer referencia, cobertura deportiva y funciones para aficionados."
          ]
        },
        {
          title: "Tus Opciones",
          body: [
            "Puedes gestionar opciones de consentimiento de anuncios en la configuracion de privacidad de la app web de Rodeo Daily. Tambien puedes borrar almacenamiento local del navegador, bloquear cookies, limitar rastreo publicitario en la configuracion del dispositivo o usar controles ofrecidos por Apple, Google, tu navegador o herramientas de opt-out de la industria.",
            "Eliminar la app, borrar datos del navegador o quitar el PWA puede eliminar preferencias locales como favoritos y banners descartados."
          ]
        },
        {
          title: "Derechos de Privacidad",
          body: [
            "Dependiendo de donde vivas, puedes tener derechos de privacidad como solicitar acceso, correccion, eliminacion, portabilidad u optar por salir de ciertas practicas de publicidad dirigida o comparticion.",
            `Para hacer una solicitud de privacidad, contacta a ${contactEmail}. Rodeo Daily puede necesitar verificar tu solicitud antes de actuar.`
          ]
        }
      ]
    },
    support: {
      title: "Soporte de Rodeo Daily",
      description:
        "Obtén soporte para Rodeo Daily en iOS, app web y PWA, incluyendo standings PRCA y WPRA, resultados de rodeo, calendarios, perfiles de atletas, anuncios y privacidad.",
      eyebrow: "Soporte",
      intro:
        "Recibe ayuda con la app Rodeo Daily para iOS, app web, PWA, standings PRCA, standings WPRA, resultados de rodeo, calendarios, perfiles de atletas, anuncios y configuracion de privacidad.",
      contact:
        "Para soporte de la app, reportes de errores, solicitudes de funciones o preguntas sobre datos, envia un email a",
      sections: [
        {
          title: "Antes de Enviar Email",
          body: [
            "Incluye el dispositivo que usas, la version de la app o navegador, la pagina donde estabas, el nombre del rodeo o atleta si aplica, y una captura de pantalla cuando sea posible.",
            "Para errores, el reporte mas util explica que esperabas, que ocurrio y que pasos causaron el problema."
          ]
        },
        {
          title: "Ayuda de la App para iOS",
          body: [
            "Si la app de iPhone no muestra standings, resultados o calendarios recientes, primero revisa si hay una actualizacion en App Store y luego cierra y vuelve a abrir Rodeo Daily.",
            "Favoritos, atletas seguidos, notificaciones y preferencias de visualizacion pueden guardarse en tu dispositivo. Eliminar la app puede borrar configuraciones locales."
          ]
        },
        {
          title: "Ayuda del App Web y PWA",
          body: [
            "Si instalaste Rodeo Daily con Agregar a Pantalla de Inicio, tu navegador puede cachear archivos para abrir el PWA rapidamente. Recargar la pagina o quitar y volver a agregar el PWA puede ayudar despues de una actualizacion.",
            "El sitio guarda elecciones locales como favoritos, consentimiento y banners descartados en el navegador. Borrar los datos del sitio puede restablecer esas elecciones."
          ]
        },
        {
          title: "Preguntas Sobre Datos de Rodeo",
          body: [
            "Rodeo Daily muestra standings, resultados, calendarios, daysheets, perfiles de atletas e informacion relacionada desde PRCA, WPRA y otras fuentes de datos de rodeo.",
            "Si un resultado, ranking o calendario difiere de una fuente oficial, puede deberse a tiempos de actualizacion, correcciones o retrasos de datos. Para inscripciones oficiales, pagos o decisiones finales, contacta a la asociacion oficial o a la oficina del rodeo."
          ]
        },
        {
          title: "Anuncios y Privacidad",
          body: [
            "Rodeo Daily puede mostrar anuncios en la app iOS y en el sitio. Las opciones de anuncios web se pueden gestionar en la configuracion de la app en este sitio.",
            "Los detalles de privacidad, publicidad, almacenamiento del navegador y opciones de usuario estan en la Politica de Privacidad."
          ],
          link: { href: "/mx/privacy", label: "Leer la Politica de Privacidad" }
        }
      ]
    },
    marketing: {
      title: "Rodeo Daily para iPhone",
      description:
        "Descarga Rodeo Daily para iPhone para seguir standings PRCA y WPRA, resultados de rodeo, calendarios, daysheets, perfiles de atletas, favoritos y actualizaciones de rodeo.",
      eyebrow: "Rodeo Daily para iPhone",
      headline: "Sigue standings, resultados, calendarios y atletas de rodeo en una sola app.",
      intro:
        "Rodeo Daily reúne standings PRCA, standings WPRA, resultados de rodeo, calendarios, daysheets, perfiles de atletas, favoritos y herramientas de referencia en una experiencia rapida para iPhone.",
      builtFor: "Hecho Para Aficionados al Rodeo",
      listTitle: "Todo lo que revisas durante la temporada de rodeo, organizado para acceso rapido.",
      footerTitle: "Descarga Rodeo Daily en App Store.",
      footerBody:
        "Usa Rodeo Daily en iPhone para la experiencia completa de la app, o abre el app web cuando estes en otro dispositivo.",
      features: [
        { title: "Standings", body: "Sigue standings PRCA y WPRA por temporada, evento, circuito y tipo." },
        { title: "Resultados", body: "Consulta resultados, posiciones por round, average, pagos y actualizaciones recientes." },
        { title: "Calendario", body: "Encuentra proximos rodeos, fechas, ubicaciones, daysheets y detalles de eventos." },
        { title: "Atletas", body: "Abre perfiles con estadisticas, resultados, carrera, destacados y enlaces de biografia." },
        { title: "Favoritos", body: "Mantén atletas seguidos e informacion importante de rodeo siempre cerca." },
        { title: "Referencia", body: "Consulta NFR, campeones anteriores, listados de rodeos y recursos utiles." }
      ],
      highlights: [
        "Standings mundiales y de circuito de PRCA",
        "Standings WPRA de barrel racing y breakaway",
        "Resultados de rodeo por round y average",
        "Calendarios, daysheets, detalles y listados de rodeos",
        "Perfiles de atletas con estadisticas, resultados, carrera, destacados y bio",
        "Favoritos y acceso rapido al contenido seguido"
      ]
    }
  }
} as const;

export function localeAlternates(path: "privacy" | "support" | "ios-app") {
  return {
    "en-US": absoluteUrl(`/${path}`),
    "pt-BR": absoluteUrl(`/br/${path}`),
    "es-MX": absoluteUrl(`/mx/${path}`)
  };
}

export function getLocalizedContent(locale: CountryLocale) {
  return localizedContent[locale];
}

export function LocalizedPrivacyPage({ locale }: { locale: CountryLocale }) {
  const content = localizedContent[locale];
  const routes = localizedRoutes[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: content.privacy.title,
    url: absoluteUrl(routes.privacy),
    inLanguage: routes.language,
    dateModified: "2026-08-28",
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    }
  };

  return (
    <main className="seo-page privacy-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="seo-page-shell privacy-page-shell">
        <LocalizedHeader locale={locale} />
        <section className="seo-page-hero privacy-hero">
          <span>{content.privacy.eyebrow}</span>
          <h1>{content.privacy.title}</h1>
          <p>{content.privacy.intro}</p>
          <p className="privacy-updated">{content.privacy.updated}</p>
        </section>
        <section className="app-card privacy-summary-card" aria-label={content.privacy.eyebrow}>
          <h2>{locale === "br" ? "Resumo" : "Resumen"}</h2>
          <p>{content.privacy.summary}</p>
        </section>
        <section className="privacy-section-list" aria-label={content.privacy.title}>
          {content.privacy.sections.map((section) => (
            <PolicySection section={section} key={section.title} />
          ))}
        </section>
        <section className="app-card privacy-contact-card">
          <h2>{locale === "br" ? "Contato" : "Contacto"}</h2>
          <p>
            {locale === "br" ? "Para perguntas de privacidade ou suporte, entre em contato pelo email " : "Para preguntas de privacidad o soporte, contacta a "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
          <div className="support-action-row">
            <Link className="support-primary-action" href={routes.support}>
              {content.common.support}
            </Link>
            <Link className="support-secondary-action" href="/">
              {content.common.app}
            </Link>
          </div>
        </section>
        <LocalizedFooter locale={locale} />
      </section>
    </main>
  );
}

export function LocalizedSupportPage({ locale }: { locale: CountryLocale }) {
  const content = localizedContent[locale];
  const routes = localizedRoutes[locale];
  const supportMailto = `mailto:${contactEmail}?subject=Rodeo%20Daily%20Support`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: content.support.title,
    url: absoluteUrl(routes.support),
    inLanguage: routes.language,
    about: content.support.description,
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: contactEmail,
      contactType: "customer support",
      availableLanguage: locale === "br" ? "Portuguese" : "Spanish"
    }
  };

  return (
    <main className="seo-page privacy-page support-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="seo-page-shell privacy-page-shell">
        <LocalizedHeader locale={locale} />
        <section className="seo-page-hero privacy-hero">
          <span>{content.support.eyebrow}</span>
          <h1>{content.support.title}</h1>
          <p>{content.support.intro}</p>
        </section>
        <section className="app-card privacy-summary-card support-contact-card" aria-label={content.support.title}>
          <h2>{locale === "br" ? "Contato do Suporte" : "Contacto de Soporte"}</h2>
          <p>
            {content.support.contact} <a href={supportMailto}>{contactEmail}</a>.
          </p>
          <div className="support-action-row">
            <a className="support-primary-action" href={supportMailto}>
              {content.common.supportEmail}
            </a>
            <a className="support-secondary-action" href={appStoreUrl} target="_blank" rel="noreferrer">
              {content.common.viewIosApp}
            </a>
          </div>
        </section>
        <section className="privacy-section-list" aria-label={content.support.eyebrow}>
          {content.support.sections.map((section) => (
            <PolicySection section={section} key={section.title} />
          ))}
        </section>
        <section className="app-card privacy-contact-card">
          <h2>{locale === "br" ? "Notas de Resposta" : "Notas de Respuesta"}</h2>
          <p>
            {locale === "br"
              ? "O suporte do Rodeo Daily e feito por email. Esta pagina nao e um canal oficial de associacao de rodeio e nao deve ser usada para inscricoes, disputas de pagamento, emergencias medicas ou operacoes urgentes de evento."
              : "El soporte de Rodeo Daily se maneja por email. Esta pagina no es un canal oficial de asociacion de rodeo y no debe usarse para inscripciones, disputas de pago, emergencias medicas u operaciones urgentes de eventos."}
          </p>
        </section>
        <LocalizedFooter locale={locale} />
      </section>
    </main>
  );
}

export function LocalizedMarketingPage({ locale }: { locale: CountryLocale }) {
  const content = localizedContent[locale];
  const routes = localizedRoutes[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Rodeo Daily",
    applicationCategory: "SportsApplication",
    operatingSystem: "iOS",
    url: absoluteUrl(routes.marketing),
    installUrl: appStoreUrl,
    image: absoluteUrl("/rodeo-daily-icon.png"),
    inLanguage: routes.language,
    description: content.marketing.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    publisher: {
      "@type": "Organization",
      name: "Rodeo Daily",
      url: absoluteUrl("/")
    }
  };

  return (
    <main className="marketing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <section className="marketing-shell">
        <header className="marketing-header">
          <Link className="seo-page-brand" href="/">
            <RodeoDailyLogoMark />
            <span>Rodeo Daily</span>
          </Link>
          <nav className="marketing-header-links" aria-label="Rodeo Daily">
            <Link href="/news">News</Link>
            <Link href={routes.support}>{content.common.support}</Link>
            <Link href={routes.privacy}>{content.common.privacy}</Link>
            <Link href="/">{content.common.webApp}</Link>
          </nav>
        </header>
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <Image
              className="marketing-app-icon"
              src="/rodeo-daily-icon.png"
              width={88}
              height={88}
              alt="Rodeo Daily"
              priority
            />
            <span>{content.marketing.eyebrow}</span>
            <h1>{content.marketing.headline}</h1>
            <p>{content.marketing.intro}</p>
            <div className="marketing-cta-row">
              <a href={appStoreUrl} target="_blank" rel="noreferrer" aria-label={content.common.appStoreAlt}>
                <Image src="/app-store-badge.svg" width={162} height={54} alt={content.common.appStoreAlt} priority />
              </a>
              <Link className="marketing-web-link" href="/">
                {content.common.webApp}
              </Link>
            </div>
          </div>
          <MarketingPhonePreview locale={locale} />
        </section>
        <section className="marketing-feature-grid" aria-label={content.marketing.title}>
          {content.marketing.features.map((feature) => (
            <article className="app-card marketing-feature-card" key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.body}</p>
            </article>
          ))}
        </section>
        <section className="app-card marketing-list-section">
          <div>
            <span>{content.marketing.builtFor}</span>
            <h2>{content.marketing.listTitle}</h2>
          </div>
          <ul>
            {content.marketing.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>
        <section className="marketing-footer-cta">
          <h2>{content.marketing.footerTitle}</h2>
          <p>{content.marketing.footerBody}</p>
          <div className="marketing-cta-row">
            <a href={appStoreUrl} target="_blank" rel="noreferrer" aria-label={content.common.appStoreAlt}>
              <Image src="/app-store-badge.svg" width={162} height={54} alt={content.common.appStoreAlt} />
            </a>
            <Link className="marketing-web-link" href={routes.support}>
              {content.common.contactSupport}
            </Link>
          </div>
        </section>
        <LocalizedFooter locale={locale} />
      </section>
    </main>
  );
}

function LocalizedHeader({ locale }: { locale: CountryLocale }) {
  const content = localizedContent[locale];

  return (
    <header className="seo-page-header">
      <Link className="seo-page-brand" href="/">
        <RodeoDailyLogoMark />
        <span>Rodeo Daily</span>
      </Link>
      <Link className="seo-page-open-app" href="/">
        {content.common.app}
      </Link>
    </header>
  );
}

function LocalizedFooter({ locale }: { locale: CountryLocale }) {
  const content = localizedContent[locale];
  const routes = localizedRoutes[locale];

  return (
    <footer className="seo-page-footer" aria-label="Rodeo Daily">
      <Link href={routes.marketing}>{content.common.ios}</Link>
      <Link href={routes.support}>{content.common.support}</Link>
      <Link href={routes.privacy}>{content.common.privacy}</Link>
      <Link href="/">{content.common.webApp}</Link>
    </footer>
  );
}

function PolicySection({ section }: { section: HelpSection }) {
  return (
    <article className="app-card privacy-policy-section">
      <h2>{section.title}</h2>
      {section.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.link ? (
        <p>
          <Link href={section.link.href}>{section.link.label}</Link>
        </p>
      ) : null}
    </article>
  );
}

function MarketingPhonePreview({ locale }: { locale: CountryLocale }) {
  const title = locale === "br" ? "Standings" : "Standings";
  const subtitle = locale === "br" ? "Tie-Down Roping" : "Tie-Down Roping";
  const detail = locale === "br" ? "2026 World Standings" : "2026 World Standings";

  return (
    <div className="marketing-phone-preview" aria-label="Rodeo Daily">
      <div className="marketing-phone-screen">
        <div className="marketing-preview-card marketing-preview-filter">
          <strong>{title}</strong>
          <span>{subtitle}</span>
          <em>{detail}</em>
        </div>
        <div className="marketing-preview-row">
          <b>#1</b>
          <div>
            <strong>Riley Webb</strong>
            <span>Denton, TX</span>
          </div>
          <em>$279,558</em>
        </div>
        <div className="marketing-preview-row">
          <b>#2</b>
          <div>
            <strong>Haven Meged</strong>
            <span>Miles City, MT</span>
          </div>
          <em>$204,146</em>
        </div>
        <div className="marketing-preview-row">
          <b>#3</b>
          <div>
            <strong>Kincade Henry</strong>
            <span>Mount Pleasant, TX</span>
          </div>
          <em>$183,677</em>
        </div>
      </div>
    </div>
  );
}
