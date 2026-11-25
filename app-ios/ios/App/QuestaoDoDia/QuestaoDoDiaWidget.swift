import WidgetKit
import SwiftUI

// Widget da Questão do Dia (versão 1.4, 25/11/2026).
//
// Professor: "Faz os 3" (gravação de tela, áudio com a tela bloqueada e este widget). O widget mostra
// na tela inicial e na tela de bloqueio a Questão do Dia publicada (a mesma do app, a última com
// status "posted"), sem as alternativas nem a resposta. O toque abre o app direto nela
// (https://www.endodirect.com.br/#qotd/<id>, que o site trata em appUrlOpen → pushNativoAbrir).
//
// Os dados vêm de uma rota pública e leve do site (api/publico.js, rota=qotd-widget), com cache de
// borda: o widget não precisa de login, de grupo de app nem de chave nenhuma. O enunciado já é
// público (vai no story das 18h e na notificação do celular).

private let corFundo = Color(red: 11 / 255, green: 19 / 255, blue: 37 / 255)       // #0b1325, fundo do app
private let corFundo2 = Color(red: 22 / 255, green: 38 / 255, blue: 74 / 255)
private let corAzul = Color(red: 59 / 255, green: 111 / 255, blue: 212 / 255)      // #3b6fd4
private let corOuro = Color(red: 245 / 255, green: 179 / 255, blue: 44 / 255)      // #f5b32c

struct QuestaoEntrada: TimelineEntry {
    let date: Date
    let id: String?
    let sub: String
    let enunciado: String
    let semDados: Bool

    static let exemplo = QuestaoEntrada(
        date: Date(), id: nil, sub: "Tireoide",
        enunciado: "Mulher de 34 anos com TSH suprimido, T4 livre elevado, bócio difuso e oftalmopatia. Qual é o diagnóstico mais provável?",
        semDados: false)

    static let falha = QuestaoEntrada(
        date: Date(), id: nil, sub: "",
        enunciado: "Abra o Endodirect para ver a Questão do Dia.",
        semDados: true)

    // Mesmo filtro de id do botão do e-mail e da notificação (lib/push-qotd.js).
    var link: URL {
        var texto = "https://www.endodirect.com.br/#qotd"
        if let id = id, id.range(of: "^[A-Za-z0-9_-]{1,80}$", options: .regularExpression) != nil {
            texto += "/" + id
        }
        return URL(string: texto) ?? URL(string: "https://www.endodirect.com.br/")!
    }
}

private struct RespostaServidor: Decodable {
    let ok: Bool
    let qotd: Questao?

    struct Questao: Decodable {
        let id: String?
        let sub: String?
        let stem: String
    }
}

struct Provedor: TimelineProvider {
    static let endereco = URL(string: "https://www.endodirect.com.br/api/publico?rota=qotd-widget")!

    func placeholder(in context: Context) -> QuestaoEntrada {
        QuestaoEntrada.exemplo
    }

    func getSnapshot(in context: Context, completion: @escaping (QuestaoEntrada) -> Void) {
        if context.isPreview {
            completion(QuestaoEntrada.exemplo)
            return
        }
        buscar(completion)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuestaoEntrada>) -> Void) {
        buscar { entrada in
            completion(Timeline(entries: [entrada], policy: .after(Provedor.proximaAtualizacao(depois: Date()))))
        }
    }

    // A questão nova sai de manhã (07:30, horário de Brasília): o widget se atualiza às 07:40 e,
    // fora isso, a cada 3 horas (o iOS pode adiar um pouco, para poupar bateria).
    static func proximaAtualizacao(depois agora: Date) -> Date {
        var calendario = Calendar(identifier: .gregorian)
        calendario.timeZone = TimeZone(identifier: "America/Sao_Paulo") ?? TimeZone.current
        let emTresHoras = agora.addingTimeInterval(3 * 3600)
        if let manha = calendario.nextDate(after: agora, matching: DateComponents(hour: 7, minute: 40),
                                           matchingPolicy: .nextTime),
           manha < emTresHoras {
            return manha
        }
        return emTresHoras
    }

    private func buscar(_ fim: @escaping (QuestaoEntrada) -> Void) {
        var pedido = URLRequest(url: Provedor.endereco, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        pedido.setValue("application/json", forHTTPHeaderField: "Accept")
        URLSession.shared.dataTask(with: pedido) { dados, resposta, _ in
            guard let dados = dados,
                  let http = resposta as? HTTPURLResponse, http.statusCode == 200,
                  let r = try? JSONDecoder().decode(RespostaServidor.self, from: dados),
                  r.ok, let q = r.qotd, !q.stem.isEmpty else {
                fim(QuestaoEntrada.falha)
                return
            }
            fim(QuestaoEntrada(date: Date(), id: q.id, sub: q.sub ?? "", enunciado: q.stem, semDados: false))
        }.resume()
    }
}

struct QuestaoDoDiaView: View {
    @Environment(\.widgetFamily) private var familia
    let entrada: QuestaoEntrada

    var body: some View {
        switch familia {
        case .accessoryInline:
            Text("🧠 Questão do Dia")
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text("🧠 Questão do Dia")
                    .font(.headline)
                    .widgetAccentable()
                Text(entrada.enunciado)
                    .font(.caption)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        default:
            VStack(alignment: .leading, spacing: 6) {
                Text("🧠 QUESTÃO DO DIA")
                    .font(.system(size: 11, weight: .heavy))
                    .foregroundColor(corOuro)
                if !entrada.sub.isEmpty {
                    Text(entrada.sub)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white.opacity(0.9))
                        .lineLimit(1)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 2)
                        .background(corAzul.opacity(0.6))
                        .clipShape(Capsule())
                }
                Text(entrada.enunciado)
                    .font(.system(size: familia == .systemSmall ? 12 : 13))
                    .foregroundColor(.white)
                    .lineLimit(familia == .systemSmall ? 5 : (familia == .systemMedium ? 4 : 12))
                Spacer(minLength: 0)
                Text(entrada.semDados ? "Toque para abrir" : "Toque para responder →")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(corOuro)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

private struct FundoDoWidget: ViewModifier {
    func body(content: Content) -> some View {
        let gradiente = LinearGradient(colors: [corFundo, corFundo2], startPoint: .topLeading, endPoint: .bottomTrailing)
        if #available(iOS 17.0, *) {
            content.containerBackground(for: .widget) { gradiente }
        } else {
            content.padding().background(gradiente)
        }
    }
}

@main
struct QuestaoDoDiaWidget: Widget {
    let kind = "QuestaoDoDia"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provedor()) { entrada in
            QuestaoDoDiaView(entrada: entrada)
                .modifier(FundoDoWidget())
                .widgetURL(entrada.link)
        }
        .configurationDisplayName("Questão do Dia")
        .description("A Questão do Dia do Endodirect na sua tela. Toque para responder.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}
