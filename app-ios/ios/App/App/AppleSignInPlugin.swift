import Foundation
import UIKit
import AuthenticationServices
import Capacitor

// "Entrar com a Apple" nativo (folha da Apple, com Face ID/Touch ID), exposto à página
// do site como Capacitor.Plugins.AppleSignIn.
//
// Por que existe (10/11/2026): o app oferece login com Google, e a diretriz 4.8 da App
// Store exige oferecer também o "Entrar com a Apple". O site chama `entrar({nonce})`
// com o SHA-256 de um nonce aleatório; a Apple devolve o identityToken (JWT) com esse
// hash, e o site troca o token por sessão no Supabase (signInWithIdToken, com o nonce
// cru). O token nunca passa por servidor nosso.
//
// O plugin é do próprio app (não vem do npm): ele é registrado em AppViewController.
@objc(AppleSignInPlugin)
public class AppleSignInPlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "AppleSignInPlugin"
    public let jsName = "AppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "entrar", returnType: CAPPluginReturnPromise)
    ]

    // Um pedido por vez: a folha da Apple é modal.
    private var chamadaPendente: CAPPluginCall?

    @objc func entrar(_ call: CAPPluginCall) {
        let nonce = call.getString("nonce") ?? ""
        DispatchQueue.main.async {
            if self.chamadaPendente != nil {
                call.reject("Já há um login com a Apple em andamento.", "EM_ANDAMENTO")
                return
            }
            let pedido = ASAuthorizationAppleIDProvider().createRequest()
            pedido.requestedScopes = [.fullName, .email]
            if !nonce.isEmpty {
                pedido.nonce = nonce
            }
            let controle = ASAuthorizationController(authorizationRequests: [pedido])
            controle.delegate = self
            controle.presentationContextProvider = self
            self.chamadaPendente = call
            controle.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        if let janela = bridge?.viewController?.view.window {
            return janela
        }
        let cenas = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        if let janela = cenas.flatMap({ $0.windows }).first(where: { $0.isKeyWindow }) {
            return janela
        }
        return ASPresentationAnchor()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let call = chamadaPendente else { return }
        chamadaPendente = nil
        guard let credencial = authorization.credential as? ASAuthorizationAppleIDCredential,
              let dadosToken = credencial.identityToken,
              let token = String(data: dadosToken, encoding: .utf8) else {
            call.reject("A Apple não devolveu o token de identidade.", "SEM_TOKEN")
            return
        }
        var codigo = ""
        if let dadosCodigo = credencial.authorizationCode, let texto = String(data: dadosCodigo, encoding: .utf8) {
            codigo = texto
        }
        // Nome e e-mail só vêm no PRIMEIRO login desta Conta Apple com o app.
        call.resolve([
            "identityToken": token,
            "authorizationCode": codigo,
            "user": credencial.user,
            "email": credencial.email ?? "",
            "givenName": credencial.fullName?.givenName ?? "",
            "familyName": credencial.fullName?.familyName ?? ""
        ])
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard let call = chamadaPendente else { return }
        chamadaPendente = nil
        if let erroApple = error as? ASAuthorizationError, erroApple.code == .canceled {
            call.reject("Login com a Apple cancelado.", "CANCELADO")
            return
        }
        call.reject(error.localizedDescription, "ERRO_APPLE", error)
    }
}
