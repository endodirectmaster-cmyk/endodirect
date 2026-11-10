import UIKit
import Capacitor

// Controlador principal do app: o mesmo do Capacitor, mais o registro dos plugins que
// são do próprio app (hoje, só o "Entrar com a Apple"). O SceneDelegate e o
// Main.storyboard apontam para esta classe.
class AppViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleSignInPlugin())
    }
}
