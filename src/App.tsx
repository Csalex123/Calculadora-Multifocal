import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Calculator,
  Trash2,
  History,
  Glasses,
  Flame,
  AlertCircle,
  X,
  Clipboard,
  Volume2,
  EyeOff,
  Eye,
} from "lucide-react";

interface Medicao {
  esferico: string;
  cilindro: string;
  eixo: string;
}

interface Calculo {
  id: string;
  nome: string;
  receitaImagem: string;
  data: string;
  hora: string;
  resultado: number;
  valores: {
    longeOD: Medicao;
    longeOE: Medicao;
    pertoOD: Medicao;
    pertoOE: Medicao;
  };
}

function App() {
  const [nome, setNome] = useState("");
  const [receitaImagem, setReceitaImagem] = useState("");
  const [historico, setHistorico] = useState<Calculo[]>([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [resultado, setResultado] = useState<number | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [copiado, setCopiado] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [botaoCalcularAtivo, setBotaoCalcularAtivo] = useState(false);
  const itensPorPagina = 3;

  // Estado para campos de visão de longe
  const [longeOD, setLongeOD] = useState<Medicao>({
    esferico: "0",
    cilindro: "0",
    eixo: "0",
  });
  const [longeOE, setLongeOE] = useState<Medicao>({
    esferico: "0",
    cilindro: "0",
    eixo: "0",
  });

  // Estado para campos de visão de perto
  const [pertoOD, setPertoOD] = useState<Medicao>({
    esferico: "0",
    cilindro: "0",
    eixo: "0",
  });
  const [pertoOE, setPertoOE] = useState<Medicao>({
    esferico: "0",
    cilindro: "0",
    eixo: "0",
  });

  const [inputValues, setInputValues] = useState({
    longeOD: { esferico: "0", cilindro: "0", eixo: "0" },
    longeOE: { esferico: "0", cilindro: "0", eixo: "0" },
    pertoOD: { esferico: "0", cilindro: "0", eixo: "0" },
    pertoOE: { esferico: "0", cilindro: "0", eixo: "0" },
  });

  const isFormValid = () => {
    return (
      inputValues.longeOD.esferico !== "" &&
      inputValues.longeOD.cilindro !== "" &&
      inputValues.longeOD.eixo !== "" &&
      inputValues.longeOE.esferico !== "" &&
      inputValues.longeOE.cilindro !== "" &&
      inputValues.longeOE.eixo !== "" &&
      inputValues.pertoOD.esferico !== "" &&
      inputValues.pertoOD.cilindro !== "" &&
      inputValues.pertoOD.eixo !== "" &&
      inputValues.pertoOE.esferico !== "" &&
      inputValues.pertoOE.cilindro !== "" &&
      inputValues.pertoOE.eixo !== ""
    );
  };

  useEffect(() => {
    const historicoSalvo = localStorage.getItem("historicoCalculos");
    if (historicoSalvo) {
      setHistorico(JSON.parse(historicoSalvo));
    }
  }, []);

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceitaImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calcularAdicao = (e: React.FormEvent) => {
    e.preventDefault();

    setLongeOD(inputValues.longeOD);
    setLongeOE(inputValues.longeOE);
    setPertoOD(inputValues.pertoOD);
    setPertoOE(inputValues.pertoOE);

    const adicaoOD = Math.abs(
      Number(inputValues.pertoOD.esferico) - Number(inputValues.longeOD.esferico)
    );
    const adicaoOE = Math.abs(
      Number(inputValues.pertoOE.esferico) - Number(inputValues.longeOE.esferico)
    );
    const mediaAdicao = (adicaoOD + adicaoOE) / 2;

    setResultado(mediaAdicao);
    setBotaoCalcularAtivo(true);
    setTimeout(() => setBotaoCalcularAtivo(false), 2000);

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR");
    const horaFormatada = agora.toLocaleTimeString("pt-BR");

    const novoCalculo: Calculo = {
      id: Date.now().toString(),
      nome: "",
      receitaImagem: "",
      data: dataFormatada,
      hora: horaFormatada,
      resultado: mediaAdicao,
      valores: {
        longeOD: inputValues.longeOD,
        longeOE: inputValues.longeOE,
        pertoOD: inputValues.pertoOD,
        pertoOE: inputValues.pertoOE,
      },
    };

    const novoHistorico = [novoCalculo, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("historicoCalculos", JSON.stringify(novoHistorico));
  };

  const limparFormulario = () => {
    setNome("");
    setReceitaImagem("");
    setInputValues({
      longeOD: { esferico: "0", cilindro: "0", eixo: "0" },
      longeOE: { esferico: "0", cilindro: "0", eixo: "0" },
      pertoOD: { esferico: "0", cilindro: "0", eixo: "0" },
      pertoOE: { esferico: "0", cilindro: "0", eixo: "0" },
    });
  };

  const limparHistorico = () => {
    setHistorico([]);
    localStorage.removeItem("historicoCalculos");
    setMostrarConfirmacao(false);
    setMensagem("Histórico apagado com sucesso!");
    setTimeout(() => setMensagem(""), 3000);
  };

  const copiarHistorico = () => {
    const historicoTexto = historico
      .map(
        (calculo) =>
          `Nome: ${calculo.nome}\nData: ${calculo.data} às ${
            calculo.hora
          }\nResultado: ${calculo.resultado.toFixed(2)}\n`
      )
      .join("\n");
    navigator.clipboard.writeText(historicoTexto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleConfirmacao = () => {
    limparHistorico();
    setMostrarConfirmacao(false);
  };

  const escutarHistorico = () => {
    const historicoTexto = historico
      .map(
        (calculo) =>
          `Nome: ${calculo.nome}, Data: ${calculo.data} às ${
            calculo.hora
          }, Resultado: ${calculo.resultado.toFixed(2)}`
      )
      .join(". ");
    const utterance = new SpeechSynthesisUtterance(historicoTexto);
    speechSynthesis.speak(utterance);
  };

  const handleInputChange =
    (
      section: keyof typeof inputValues,
      field: keyof Medicao
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setInputValues((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    };

  const InputMedicao = ({
    label,
    section,
  }: {
    label: string;
    section: keyof typeof inputValues;
  }) => (
    <div className="space-y-2">
      <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Esférico
          </label>
          <input
            type="number"
            step="0.25"
            value={inputValues[section].esferico}
            onChange={handleInputChange(section, "esferico")}
            required
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Cilindro
          </label>
          <input
            type="number"
            step="0.25"
            value={inputValues[section].cilindro}
            onChange={handleInputChange(section, "cilindro")}
            required
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400">
            Eixo
          </label>
          <input
            type="number"
            min="0"
            max="180"
            value={inputValues[section].eixo}
            onChange={handleInputChange(section, "eixo")}
            required
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );

  const historicoPaginado = historico.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const apagarCalculo = (id: string) => {
    const novoHistorico = historico.filter((calculo) => calculo.id !== id);
    setHistorico(novoHistorico);
    localStorage.setItem("historicoCalculos", JSON.stringify(novoHistorico));
    setMensagem("Cálculo apagado com sucesso!");
    setTimeout(() => setMensagem(""), 3000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <header className="py-6 shadow-lg bg-red-600 dark:bg-gray-800 text-white">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Calculadora Multifocal</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMostrarHistorico(!mostrarHistorico)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {mostrarHistorico ? (
                <>
                  <EyeOff className="w-5 h-5" />
                  Ocultar Histórico
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Mostrar Histórico
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {mostrarConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Confirmar Exclusão
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja apagar todo o histórico? Esta ação não
                pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarConfirmacao(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmacao}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <form onSubmit={calcularAdicao} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b pb-2">
                  Visão de Longe
                </h3>
                <div className="space-y-4">
                  <InputMedicao
                    label="OD (Olho Direito)"
                    section="longeOD"
                  />
                  <InputMedicao
                    label="OE (Olho Esquerdo)"
                    section="longeOE"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <form onSubmit={calcularAdicao} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white border-b pb-2">
                  Visão de Perto
                </h3>
                <div className="space-y-4">
                  <InputMedicao
                    label="OD (Olho Direito)"
                    section="pertoOD"
                  />
                  <InputMedicao
                    label="OE (Olho Esquerdo)"
                    section="pertoOE"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isFormValid()
                      ? botaoCalcularAtivo
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                >
                  <Calculator className="w-5 h-5" />
                  Calcular Adição
                </button>
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Limpar formulário
                </button>
              </div>
            </form>
          </div>
        </div>

        {resultado !== null && (
          <div
            style={{ marginTop: "3rem" }}
            className="mt-8 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          >
            <h2 className="text-2xl ">
              Resultado da Adição: {resultado.toFixed(2)}
            </h2>
          </div>
        )}

        {mensagem && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg shadow-lg">
            <p>{mensagem}</p>
          </div>
        )}

        {historico.length > 0 && mostrarHistorico && (
          <div className="w-full max-w-4xl mt-8" style={{ marginTop: "3rem" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Histórico de Cálculos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copiarHistorico}
                  className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Clipboard className="w-5 h-5" />
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
                <button
                  onClick={() => setMostrarConfirmacao(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-2 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Apagar Todo Histórico
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {historicoPaginado.map((calculo) => (
                <div
                  key={calculo.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-black-800 dark:text-black">
                        {calculo.nome}
                      </h3>
                      <p className="text-sm text-black-600 dark:text-black-400">
                        {calculo.data} às {calculo.hora}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-black-700 dark:text-black-300">
                        Visão de Longe
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">OD:</p>
                          <p className="text-sm text-black-600 dark:text-gray-400">
                            Esf: {calculo.valores.longeOD.esferico} | Cil:{" "}
                            {calculo.valores.longeOD.cilindro} | Eixo:{" "}
                            {calculo.valores.longeOD.eixo}°
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">OE:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Esf: {calculo.valores.longeOE.esferico} | Cil:{" "}
                            {calculo.valores.longeOE.cilindro} | Eixo:{" "}
                            {calculo.valores.longeOE.eixo}°
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-black-300">
                        Visão de Perto
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">OD:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Esf: {calculo.valores.pertoOD.esferico} | Cil:{" "}
                            {calculo.valores.pertoOD.cilindro} | Eixo:{" "}
                            {calculo.valores.pertoOD.eixo}°
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">OE:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Esf: {calculo.valores.pertoOE.esferico} | Cil:{" "}
                            {calculo.valores.pertoOE.cilindro} | Eixo:{" "}
                            {calculo.valores.pertoOE.eixo}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 font-medium text-red-600 dark:text-red-400">
                    Adição: {calculo.resultado.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            {historico.length > itensPorPagina && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setPaginaAtual(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className="px-4 py-2 mx-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 mx-1 text-gray-700 dark:text-black">
                  Página {paginaAtual} de{" "}
                  {Math.ceil(historico.length / itensPorPagina)}
                </span>
                <button
                  onClick={() => setPaginaAtual(paginaAtual + 1)}
                  disabled={
                    paginaAtual === Math.ceil(historico.length / itensPorPagina)
                  }
                  className="px-4 py-2 mx-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Próximo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
