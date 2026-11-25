import Foundation
import UIKit
import Capacitor

// Proteção da videoaula contra gravação de tela (versão 1.4, 25/11/2026).
//
// Professor, depois de fechar o Bunny só em streaming: "Faz os 3" (gravação de tela, áudio com a
// tela bloqueada e widget). O iPhone avisa quando a tela começa ou para de ser gravada ou espelhada
// (UIScreen.capturedDidChangeNotification) e quando alguém tira um print
// (UIApplication.userDidTakeScreenshotNotification). Este plugin só repassa os dois avisos à página;
// quem pausa a aula, mostra o aviso e anota no painel de contas suspeitas é o site
// (capturaAplicar / capturaRegistrar no index.html).
//
// Exposto à página como Capacitor.Plugins.Captura; registrado em AppViewController.
// Eventos: "mudou" {gravando: Bool} e "print" {}. Método: estado() → {gravando: Bool}.
@objc(CapturaPlugin)
public class CapturaPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CapturaPlugin"
    public let jsName = "Captura"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "estado", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        let centro = NotificationCenter.default
        centro.addObserver(self, selector: #selector(capturaMudou),
                           name: UIScreen.capturedDidChangeNotification, object: nil)
        centro.addObserver(self, selector: #selector(tirouPrint),
                           name: UIApplication.userDidTakeScreenshotNotification, object: nil)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // Gravação, espelhamento ou AirPlay da tela inteira: o iOS marca a tela como "capturada".
    private func gravando() -> Bool {
        if let tela = bridge?.viewController?.view.window?.windowScene?.screen {
            return tela.isCaptured
        }
        return UIScreen.main.isCaptured
    }

    @objc func estado(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(["gravando": self.gravando()])
        }
    }

    @objc private func capturaMudou() {
        DispatchQueue.main.async {
            self.notifyListeners("mudou", data: ["gravando": self.gravando()])
        }
    }

    @objc private func tirouPrint() {
        DispatchQueue.main.async {
            self.notifyListeners("print", data: [:])
        }
    }
}
