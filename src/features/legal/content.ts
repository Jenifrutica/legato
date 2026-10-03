import type { LegalDocumentsByLanguage } from './types'

const UPDATED = '2026-10-03'

export const LEGAL_DOCUMENTS: LegalDocumentsByLanguage = {
  es: [
    {
      id: 'privacy',
      title: 'Política de privacidad',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Responsable',
          paragraphs: [
            'Legato es un proyecto académico sin fines de lucro de Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia. Contacto: jenifer.urbano@campusucc.edu.co.',
          ],
        },
        {
          heading: 'Datos que tratamos',
          paragraphs: [
            'Perfil local (nombre y avatar) guardado en tu navegador; correo electrónico únicamente si activas el inicio de sesión; archivos de audio, metadatos y carátulas que importas; y el estado de reproducción (canción, posición, ajustes).',
            'No usamos analítica ni rastreadores de terceros.',
          ],
        },
        {
          heading: 'Finalidad',
          paragraphs: [
            'Reproducir y organizar tu música, recordar tu sesión y tus preferencias, y permitir la sincronización entre dispositivos cuando esa función esté activa.',
          ],
        },
        {
          heading: 'Dónde se guardan',
          paragraphs: [
            'En tu propio navegador (IndexedDB y almacenamiento local). Si activas la sincronización, se almacenan en infraestructura de AWS (S3/CloudFront) con cifrado en tránsito.',
          ],
        },
        {
          heading: 'Terceros',
          paragraphs: [
            'AWS como proveedor de hosting; Google para inicio de sesión, ACRCloud para reconocimiento por micrófono y LRCLIB para buscar letras sincronizadas enviando el título, artista y álbum de la canción en reproducción (lrclib.net). No vendemos ni compartimos tus datos con fines comerciales.',
          ],
        },
        {
          heading: 'Retención y derechos',
          paragraphs: [
            'Conservamos tus datos hasta que elimines tu biblioteca o tu cuenta. Puedes solicitar acceso, corrección, actualización o supresión escribiendo al correo de contacto.',
          ],
        },
        {
          heading: 'Seguridad y cambios',
          paragraphs: [
            'Aplicamos medidas razonables de seguridad. Si esta política cambia, publicaremos la nueva versión con su fecha en esta misma página.',
          ],
        },
      ],
    },
    {
      id: 'terms',
      title: 'Términos y condiciones',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Naturaleza del servicio',
          paragraphs: [
            'Legato es un proyecto académico sin fines de lucro. Se ofrece tal cual, sin garantías de disponibilidad ni de conservación de datos.',
          ],
        },
        {
          heading: 'Uso permitido',
          paragraphs: [
            'El uso es personal. No está permitido el uso comercial ni subir contenido sobre el que no tengas derechos. Cada persona es responsable de la música que importa a su biblioteca privada.',
          ],
        },
        {
          heading: 'Propiedad intelectual',
          paragraphs: [
            'El software, la marca y el diseño pertenecen a su autora. Las canciones pertenecen a sus respectivos titulares; la app no distribuye música.',
          ],
        },
        {
          heading: 'Limitación de responsabilidad',
          paragraphs: [
            'En la medida permitida por la ley, no respondemos por daños derivados del uso de la aplicación, incluida la pérdida de datos locales.',
          ],
        },
        {
          heading: 'Retiro de contenido',
          paragraphs: [
            'Si eres titular de derechos y consideras que algún contenido alojado por un usuario infringe tus derechos, escríbenos al correo de contacto para atender la solicitud.',
          ],
        },
        {
          heading: 'Ley aplicable',
          paragraphs: ['Estos términos se rigen por las leyes de Colombia.'],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Política de cookies',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Qué usamos',
          paragraphs: [
            'Legato usa únicamente almacenamiento técnico esencial: preferencias de consentimiento, idioma, opciones de accesibilidad y, si activas el inicio de sesión, la sesión de autenticación.',
            'No usamos cookies de terceros, publicidad ni analítica.',
          ],
        },
        {
          heading: 'Detalle',
          paragraphs: [
            'legato.consent (preferencia de cookies), legato.language (idioma), legato.a11y (accesibilidad) y legato.auth (perfil local o sesión). Todos son persistentes y permanecen en tu navegador.',
          ],
        },
        {
          heading: 'Base legal',
          paragraphs: [
            'Las cookies esenciales son necesarias para prestar el servicio. Las opcionales requieren tu consentimiento y hoy no existe ninguna; el centro de preferencias queda preparado para el futuro.',
          ],
        },
        {
          heading: 'Cómo gestionarlas',
          paragraphs: [
            'Puedes abrir el centro de preferencias desde el aviso de cookies o desde el enlace de esta página, y también borrar el almacenamiento desde la configuración de tu navegador.',
          ],
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Declaración de accesibilidad',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Compromiso',
          paragraphs: [
            'Legato busca cumplir las pautas WCAG 2.2 nivel AA en sus pantallas principales.',
          ],
        },
        {
          heading: 'Medidas',
          paragraphs: [
            'Navegación completa por teclado, foco visible, texto alternativo en imágenes, formularios etiquetados, contraste verificado y un panel con tamaño de texto, tipografía para dislexia, alto contraste, reducción de movimiento, modos para daltonismo y controles grandes.',
          ],
        },
        {
          heading: 'Limitaciones conocidas',
          paragraphs: [
            'Algunas visualizaciones (ondas y modo estructura) dependen de canvas y se anuncian por texto alternativo; estamos mejorando su experiencia con lectores de pantalla.',
          ],
        },
        {
          heading: 'Contacto',
          paragraphs: [
            'Si encuentras una barrera de accesibilidad, escríbenos a jenifer.urbano@campusucc.edu.co y la corregiremos durante el proyecto.',
          ],
        },
      ],
    },
  ],
  en: [
    {
      id: 'privacy',
      title: 'Privacy policy',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Controller',
          paragraphs: [
            'Legato is a non-profit academic project by Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia. Contact: jenifer.urbano@campusucc.edu.co.',
          ],
        },
        {
          heading: 'Data we process',
          paragraphs: [
            'Local profile (name and avatar) stored in your browser; email only if you enable sign-in; audio files, metadata and artwork you import; and playback state (song, position, settings).',
            'We do not use analytics or third-party trackers.',
          ],
        },
        {
          heading: 'Purpose',
          paragraphs: [
            'Play and organize your music, remember your session and preferences, and enable cross-device sync when that feature is active.',
          ],
        },
        {
          heading: 'Where it is stored',
          paragraphs: [
            'In your own browser (IndexedDB and local storage). If you enable sync, it is stored on AWS infrastructure (S3/CloudFront) with encryption in transit.',
          ],
        },
        {
          heading: 'Third parties',
          paragraphs: [
            'AWS as hosting provider; Google for sign-in, ACRCloud for microphone recognition and LRCLIB to look up synced lyrics by sending the title, artist and album of the playing song (lrclib.net). We never sell your data.',
          ],
        },
        {
          heading: 'Retention and rights',
          paragraphs: [
            'We keep your data until you delete your library or account. You may request access, correction, update or deletion by writing to the contact email.',
          ],
        },
        {
          heading: 'Security and changes',
          paragraphs: [
            'We apply reasonable security measures. If this policy changes, the new version will be published here with its date.',
          ],
        },
      ],
    },
    {
      id: 'terms',
      title: 'Terms and conditions',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Nature of the service',
          paragraphs: [
            'Legato is a non-profit academic project provided as is, without availability or data-retention guarantees.',
          ],
        },
        {
          heading: 'Permitted use',
          paragraphs: [
            'Use is personal. Commercial use and uploading content you do not own are not allowed. Each person is responsible for the music imported into their private library.',
          ],
        },
        {
          heading: 'Intellectual property',
          paragraphs: [
            'The software, brand and design belong to their author. Songs belong to their respective owners; the app does not distribute music.',
          ],
        },
        {
          heading: 'Limitation of liability',
          paragraphs: [
            'To the extent permitted by law, we are not liable for damages arising from use of the application, including loss of local data.',
          ],
        },
        {
          heading: 'Content takedown',
          paragraphs: [
            'If you own rights and believe user-hosted content infringes them, write to the contact email so we can address the request.',
          ],
        },
        {
          heading: 'Governing law',
          paragraphs: ['These terms are governed by the laws of Colombia.'],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookie policy',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'What we use',
          paragraphs: [
            'Legato uses only essential technical storage: consent preferences, language, accessibility options and, if you enable sign-in, the authentication session.',
            'We do not use third-party, advertising or analytics cookies.',
          ],
        },
        {
          heading: 'Details',
          paragraphs: [
            'legato.consent (cookie preference), legato.language (language), legato.a11y (accessibility) and legato.auth (local profile or session). All are persistent and stay in your browser.',
          ],
        },
        {
          heading: 'Legal basis',
          paragraphs: [
            'Essential storage is required to provide the service. Optional cookies need your consent and there are none today; the preference center is ready for the future.',
          ],
        },
        {
          heading: 'Managing them',
          paragraphs: [
            'You can open the preference center from the cookie notice or the link on this page, and clear storage from your browser settings.',
          ],
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessibility statement',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Commitment',
          paragraphs: ['Legato aims to meet WCAG 2.2 level AA on its main screens.'],
        },
        {
          heading: 'Measures',
          paragraphs: [
            'Full keyboard navigation, visible focus, alternative text, labeled forms, verified contrast and a panel with text size, dyslexia-friendly font, high contrast, reduced motion, color-blind modes and large controls.',
          ],
        },
        {
          heading: 'Known limitations',
          paragraphs: [
            'Some visualizations (waves and structure mode) rely on canvas and are announced through alternative text; we are improving their screen-reader experience.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            'If you find an accessibility barrier, write to jenifer.urbano@campusucc.edu.co and we will fix it during the project.',
          ],
        },
      ],
    },
  ],
  pt: [
    {
      id: 'privacy',
      title: 'Política de privacidade',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Responsável',
          paragraphs: [
            'Legato é um projeto acadêmico sem fins lucrativos de Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia. Contato: jenifer.urbano@campusucc.edu.co.',
          ],
        },
        {
          heading: 'Dados que tratamos',
          paragraphs: [
            'Perfil local (nome e avatar) no seu navegador; e-mail apenas se ativar o login; arquivos de áudio, metadados e capas que você importa; e o estado de reprodução (música, posição, ajustes).',
            'Não usamos análise nem rastreadores de terceiros.',
          ],
        },
        {
          heading: 'Finalidade',
          paragraphs: [
            'Reproduzir e organizar sua música, lembrar sua sessão e preferências e permitir sincronização entre dispositivos quando essa função estiver ativa.',
          ],
        },
        {
          heading: 'Onde ficam',
          paragraphs: [
            'No seu próprio navegador (IndexedDB e armazenamento local). Se ativar a sincronização, ficam na infraestrutura da AWS (S3/CloudFront) com criptografia em trânsito.',
          ],
        },
        {
          heading: 'Terceiros',
          paragraphs: [
            'AWS como hospedagem; Google para login, ACRCloud para reconhecimento por microfone e LRCLIB para buscar letras sincronizadas enviando título, artista e álbum da música em reprodução (lrclib.net). Nunca vendemos seus dados.',
          ],
        },
        {
          heading: 'Retenção e direitos',
          paragraphs: [
            'Mantemos seus dados até você excluir sua biblioteca ou conta. Você pode solicitar acesso, correção, atualização ou exclusão pelo e-mail de contato.',
          ],
        },
        {
          heading: 'Segurança e mudanças',
          paragraphs: [
            'Aplicamos medidas razoáveis de segurança. Se esta política mudar, a nova versão será publicada aqui com a data.',
          ],
        },
      ],
    },
    {
      id: 'terms',
      title: 'Termos e condições',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Natureza do serviço',
          paragraphs: [
            'Legato é um projeto acadêmico sem fins lucrativos, fornecido como está, sem garantias de disponibilidade ou retenção de dados.',
          ],
        },
        {
          heading: 'Uso permitido',
          paragraphs: [
            'O uso é pessoal. Não é permitido uso comercial nem enviar conteúdo sem direitos. Cada pessoa é responsável pela música importada para sua biblioteca privada.',
          ],
        },
        {
          heading: 'Propriedade intelectual',
          paragraphs: [
            'O software, a marca e o design pertencem à autora. As músicas pertencem aos seus titulares; o app não distribui música.',
          ],
        },
        {
          heading: 'Limitação de responsabilidade',
          paragraphs: [
            'Na medida permitida por lei, não nos responsabilizamos por danos decorrentes do uso, incluindo perda de dados locais.',
          ],
        },
        {
          heading: 'Remoção de conteúdo',
          paragraphs: [
            'Se você é titular de direitos e acredita que conteúdo hospedado por usuários os infringe, escreva para o e-mail de contato.',
          ],
        },
        {
          heading: 'Lei aplicável',
          paragraphs: ['Estes termos são regidos pelas leis da Colômbia.'],
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Política de cookies',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'O que usamos',
          paragraphs: [
            'Legato usa apenas armazenamento técnico essencial: preferências de consentimento, idioma, opções de acessibilidade e, se ativar o login, a sessão de autenticação.',
            'Não usamos cookies de terceiros, publicidade ou análise.',
          ],
        },
        {
          heading: 'Detalhes',
          paragraphs: [
            'legato.consent (preferência de cookies), legato.language (idioma), legato.a11y (acessibilidade) e legato.auth (perfil local ou sessão). Todos são persistentes e ficam no seu navegador.',
          ],
        },
        {
          heading: 'Base legal',
          paragraphs: [
            'O armazenamento essencial é necessário para o serviço. Cookies opcionais exigem consentimento e hoje não existem; o centro de preferências está pronto para o futuro.',
          ],
        },
        {
          heading: 'Como gerenciar',
          paragraphs: [
            'Você pode abrir o centro de preferências pelo aviso de cookies ou pelo link desta página, e limpar o armazenamento nas configurações do navegador.',
          ],
        },
      ],
    },
    {
      id: 'accessibility',
      title: 'Declaração de acessibilidade',
      updatedAt: UPDATED,
      sections: [
        {
          heading: 'Compromisso',
          paragraphs: [
            'O Legato busca atender às diretrizes WCAG 2.2 nível AA nas telas principais.',
          ],
        },
        {
          heading: 'Medidas',
          paragraphs: [
            'Navegação completa por teclado, foco visível, texto alternativo, formulários rotulados, contraste verificado e um painel com tamanho de texto, fonte para dislexia, alto contraste, redução de movimento, modos para daltonismo e controles grandes.',
          ],
        },
        {
          heading: 'Limitações conhecidas',
          paragraphs: [
            'Algumas visualizações (ondas e modo estrutura) dependem de canvas e são anunciadas por texto alternativo; estamos melhorando a experiência com leitores de tela.',
          ],
        },
        {
          heading: 'Contato',
          paragraphs: [
            'Se encontrar uma barreira de acessibilidade, escreva para jenifer.urbano@campusucc.edu.co e corrigiremos durante o projeto.',
          ],
        },
      ],
    },
  ],
}
