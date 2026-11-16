import UIKit
import WebKit
import Capacitor

// Controlador principal do app: o mesmo do Capacitor, mais o registro dos plugins que
// são do próprio app (hoje, só o "Entrar com a Apple"). O SceneDelegate e o
// Main.storyboard apontam para esta classe.
class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleSignInPlugin())
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
