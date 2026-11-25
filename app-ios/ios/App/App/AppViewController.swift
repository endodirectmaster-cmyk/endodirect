import UIKit
import WebKit
import AuthenticationServices
import Capacitor

// Controlador principal do app: o mesmo do Capacitor, mais o registro dos plugins que
// são do próprio app ("Entrar com a Apple", login do Google e, desde a 1.4, a captura de tela).
// O SceneDelegate e o Main.storyboard apontam para esta classe.
class AppViewController: CAPBridgeViewController {
    // Versão 1.4: sem Picture in Picture. A janelinha flutuante mostra o vídeo sem a marca d'água
    // (que é desenhada pela página por cima do vídeo) e fora da proteção contra gravação de tela.
    // Com a tela bloqueada, o aluno segue ouvindo a aula (AppDelegate + site), sem expor o vídeo.
    override open func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let configuracao = super.webViewConfiguration(for: instanceConfiguration)
        configuracao.allowsPictureInPictureMediaPlayback = false
        return configuracao
    }

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleSignInPlugin())
        bridge?.registerPluginInstance(WebAuthPlugin())
        // Versão 1.4: avisa a página quando a tela é gravada/espelhada ou quando tiram print.
        bridge?.registerPluginInstance(CapturaPlugin())
        // Calculadora de reganho pós-GLP-1 (site dos autores, aberto num quadro dentro do
        // Endodirect): teclado numérico nos campos de número. Vale também para quadros de
        // outro domínio (forMainFrameOnly: false); o próprio script só age nesse site.
        let teclado = WKUserScript(source: AppViewController.tecladoNumericoCalculadora,
                                   injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        webView?.configuration.userContentController.addUserScript(teclado)
    }

    // Professor, 16/11/2026, com prints da calculadora no iPhone: "Deixar teclado numérico".
    // Os campos do site são <input type="number"> sem inputmode: o iPhone abre o teclado de
    // números e símbolos. Inteiros (idade, meses, pés, polegadas) ganham o teclado só de
    // algarismos. Os de casa decimal (peso, altura) ganham o teclado decimal; como no iPhone em
    // português esse teclado tem vírgula, que um campo "number" de página em inglês recusaria
    // (valor vazio), eles viram texto e a vírgula vira ponto antes de o site ler o valor (o
    // ouvinte do site é do próprio campo; o nosso, em captura no document, roda antes). O
    // estilo do site para input[type="number"] é copiado para esses campos. A conta continua
    // sendo a do site. Teste: scripts/test-app-ios-teclado-calculadora.js.
    static let tecladoNumericoCalculadora = #"""
(function () {
  if (!/(^|\.)glp1regainrisk\.com$/i.test(location.hostname)) return;
  if (window.__endodirectTeclado) return;
  window.__endodirectTeclado = true;
  var MARCA = 'data-endodirect-decimal';

  function copiaEstilo() {
    var folhas = document.styleSheets;
    for (var i = 0; i < folhas.length; i++) {
      var regras;
      try { regras = folhas[i].cssRules; } catch (e) { continue; }
      if (!regras) continue;
      var novas = [];
      for (var j = 0; j < regras.length; j++) {
        var r = regras[j];
        if (r.selectorText && /input\[type=["']?number["']?\]/.test(r.selectorText)) {
          novas.push(r.cssText.replace(/input\[type=["']?number["']?\]/g, 'input[' + MARCA + ']'));
        }
      }
      for (var k = 0; k < novas.length; k++) {
        try { folhas[i].insertRule(novas[k], folhas[i].cssRules.length); } catch (e) {}
      }
    }
  }

  function limpa(v) {
    v = String(v).replace(/,/g, '.').replace(/[^0-9.]/g, '');
    var p = v.indexOf('.');
    if (p >= 0) v = v.slice(0, p + 1) + v.slice(p + 1).replace(/\./g, '');
    return v;
  }

  function ajusta() {
    var campos = document.querySelectorAll('input[type="number"]');
    if (!campos.length) return;
    var algumDecimal = false;
    for (var i = 0; i < campos.length; i++) {
      var el = campos[i];
      var passo = String(el.getAttribute('step') || '');
      if (/^[0-9]+$/.test(passo)) {
        el.setAttribute('inputmode', 'numeric');
      } else {
        algumDecimal = true;
        el.setAttribute(MARCA, '1');
        el.setAttribute('inputmode', 'decimal');
        el.setAttribute('autocomplete', 'off');
        el.setAttribute('autocorrect', 'off');
        el.setAttribute('autocapitalize', 'off');
        el.setAttribute('spellcheck', 'false');
      }
    }
    if (algumDecimal) {
      copiaEstilo();
      var dec = document.querySelectorAll('input[' + MARCA + ']');
      for (var d = 0; d < dec.length; d++) dec[d].setAttribute('type', 'text');
    }
  }

  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (!el || !el.getAttribute || el.getAttribute(MARCA) !== '1') return;
    var novo = limpa(el.value);
    if (novo !== el.value) el.value = novo;
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ajusta);
  else ajusta();
})();
"""#
}

// Login com Google na folha de login da Apple (ASWebAuthenticationSession), versão 1.2.
//
// Professor, 16/11/2026: login do Google sem a pergunta "Abrir no Endodirect?". Antes o login
// abria no Safari embutido (plugin Browser) e voltava pelo endereço próprio do app; o iOS pedia
// licença para sair do Safari. A folha de login da Apple recebe esse retorno ela mesma, sem
// pergunta no fim (o iOS mostra, no começo, o aviso padrão de que o app vai usar o site para
// entrar). Exposto à página como Capacitor.Plugins.WebAuth; registrado acima.
@objc(WebAuthPlugin)
public class WebAuthPlugin: CAPPlugin, CAPBridgedPlugin, ASWebAuthenticationPresentationContextProviding {
    public let identifier = "WebAuthPlugin"
    public let jsName = "WebAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "abrir", returnType: CAPPluginReturnPromise)
    ]

    // Uma folha por vez; a referência segura a sessão viva até ela terminar.
    private var sessao: ASWebAuthenticationSession?

    @objc func abrir(_ call: CAPPluginCall) {
        guard let texto = call.getString("url"), let url = URL(string: texto), url.scheme == "https" else {
            call.reject("Endereço de login inválido.", "URL")
            return
        }
        let esquema = call.getString("esquema") ?? "br.com.endodirect.app"
        DispatchQueue.main.async {
            if self.sessao != nil {
                call.reject("Já há um login em andamento.", "EM_ANDAMENTO")
                return
            }
            let s = ASWebAuthenticationSession(url: url, callbackURLScheme: esquema) { [weak self] retorno, erro in
                self?.sessao = nil
                if let retorno = retorno {
                    call.resolve(["url": retorno.absoluteString])
                    return
                }
                if let e = erro as? ASWebAuthenticationSessionError, e.code == .canceledLogin {
                    call.reject("Login cancelado.", "CANCELADO")
                    return
                }
                call.reject(erro?.localizedDescription ?? "Não foi possível concluir o login.", "FALHA")
            }
            s.presentationContextProvider = self
            // Com a sessão compartilhada, quem já entrou no Google pelo Safari só escolhe a conta.
            s.prefersEphemeralWebBrowserSession = false
            self.sessao = s
            if !s.start() {
                self.sessao = nil
                call.reject("Não foi possível abrir o login.", "FALHA")
            }
        }
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        if let janela = bridge?.viewController?.view.window {
            return janela
        }
        let cenas = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        if let janela = cenas.flatMap({ $0.windows }).first(where: { $0.isKeyWindow }) {
            return janela
        }
        return ASPresentationAnchor()
    }
}
