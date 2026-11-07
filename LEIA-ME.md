# FOCO no iPhone

Este pacote tem dois jeitos de colocar o FOCO no iPhone.

| | Caminho A: app pela tela de início | Caminho B: arquivo IPA |
|---|---|---|
| Precisa de | iPhone + um navegador no PC | iPhone + PC Windows + conta no GitHub + Apple ID |
| Tempo | uns 5 minutos | uns 30 minutos na primeira vez |
| Ícone na tela de início | sim, abre em tela cheia | sim, é um app de verdade |
| Funciona sem internet | sim (depois da primeira abertura) | sim |
| Validade | não expira | 7 dias com Apple ID grátis (renova pelo Sideloadly) · 1 ano com conta de desenvolvedor paga |

O que tem no pacote:
- `www/` — o FOCO completo (masmorras novas e o Vulto), pronto para hospedar.
- `ios/` — o projeto do app de iPhone, que abre o FOCO dentro de um app nativo.
- `.github/workflows/build-ipa.yml` — a automação que compila o IPA num Mac do GitHub.

---

## Caminho A — app pela tela de início (o mais simples)

1. No PC, abra **app.netlify.com/drop** (é grátis; crie uma conta se pedir).
2. Arraste a pasta **`www`** inteira para a página. Em segundos aparece um link do tipo `algo.netlify.app`.
3. No iPhone, abra esse link **no Safari**.
4. Toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.
5. Pronto: o FOCO ganha ícone próprio e abre em tela cheia, como um app.

---

## Caminho B — gerar o arquivo IPA

### 1. Gerar o IPA no GitHub (sem precisar de Mac)
1. Crie uma conta em **github.com** e depois um repositório novo, como **público** (repositório público tem os minutos de Mac grátis).
2. No repositório, use **Add file › Upload files** e envie **todo o conteúdo deste pacote**: as pastas `www`, `ios` e `.github`, mais este arquivo.
   - Dica: a pasta `.github` às vezes fica oculta no Windows. Se o envio não incluir essa pasta, crie o arquivo pelo site: **Add file › Create new file**, com o nome `.github/workflows/build-ipa.yml`, e cole o conteúdo do arquivo.
3. Abra a aba **Actions**. A automação "Gerar IPA do FOCO" roda sozinha; se não rodar, clique nela e em **Run workflow**.
4. Quando ficar verde (cerca de 5 a 10 minutos), clique na execução e baixe **FOCO-ipa** em *Artifacts*. Dentro do zip está o **FOCO.ipa**.

O IPA sai **sem assinatura**. O iPhone só instala apps assinados, e a assinatura é feita no próximo passo.

### 2. Assinar e instalar pelo Windows
1. No PC, instale o **iTunes** (versão do site da Apple, não a da Microsoft Store, se o Sideloadly pedir) e o **Sideloadly** (sideloadly.io).
2. Ligue o iPhone no PC pelo cabo e toque em **Confiar** no iPhone.
3. Abra o Sideloadly, arraste o **FOCO.ipa**, digite seu **Apple ID** e clique em **Start**.
4. No iPhone:
   - Ative **Ajustes › Privacidade e Segurança › Modo de Desenvolvedor** (o iPhone reinicia).
   - Em **Ajustes › Geral › VPN e Gerenciamento de Dispositivos**, toque no seu Apple ID e em **Confiar**.
5. Abra o FOCO.

Com Apple ID grátis, o app para de abrir depois de **7 dias**. Para renovar, basta repetir o passo 3 no Sideloadly; seus dados continuam no app. Com conta de desenvolvedor paga da Apple, a assinatura dura 1 ano.

---

## Seus dados
O progresso fica salvo dentro de cada versão do app. Para levar o que você já fez:
1. Na versão antiga, vá em **Perfil › Exportar backup** e copie o texto.
2. Na versão nova, vá em **Perfil › Importar backup** e cole o texto.

## Observações
- A fonte e uma biblioteca de atualização de tela vêm da internet na primeira abertura. Sem internet, o app funciona do mesmo jeito, só com a fonte padrão do sistema.
- Se quiser trocar o identificador do app (`com.mateus.foco`), edite `ios/project.yml`.
