import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
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
  EyeOff,
  Eye,
  Camera,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
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
  const [darkMode, setDarkMode] = useState(true);
  const [resultado, setResultado] = useState<number | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [copiado, setCopiado] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [botaoCalcularAtivo, setBotaoCalcularAtivo] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const itensPorPagina = 3;

  const initialValues = {
    longeOD: { esferico: "0", cilindro: "0", eixo: "0" },
    longeOE: { esferico: "0", cilindro: "0", eixo: "0" },
    pertoOD: { esferico: "0", cilindro: "0", eixo: "0" },
    pertoOE: { esferico: "0", cilindro: "0", eixo: "0" },
  };

  const isFormValid = (values: typeof initialValues) => {
    return (
      values.longeOD.esferico !== "" &&
      values.longeOD.cilindro !== "" &&
      values.longeOD.eixo !== "" &&
      values.longeOE.esferico !== "" &&
      values.longeOE.cilindro !== "" &&
      values.longeOE.eixo !== "" &&
      values.pertoOD.esferico !== "" &&
      values.pertoOD.cilindro !== "" &&
      values.pertoOD.eixo !== "" &&
      values.pertoOE.esferico !== "" &&
      values.pertoOE.cilindro !== "" &&
      values.pertoOE.eixo !== ""
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

  const calcularAdicao = (values: typeof initialValues) => {
    const adicaoOD = Math.abs(
      Number(values.pertoOD.esferico) - Number(values.longeOD.esferico)
    );
    const adicaoOE = Math.abs(
      Number(values.pertoOE.esferico) - Number(values.longeOE.esferico)
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
        longeOD: values.longeOD,
        longeOE: values.longeOE,
        pertoOD: values.pertoOD,
        pertoOE: values.pertoOE,
      },
    };

    const novoHistorico = [novoCalculo, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem("historicoCalculos", JSON.stringify(novoHistorico));
  };

  const limparFormulario = (resetForm: () => void) => {
    setNome("");
    setReceitaImagem("");
    resetForm();
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

  const captureImage = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setReceitaImagem(imageSrc);
      setShowCamera(false);
      Tesseract.recognize(imageSrc, "eng").then(({ data: { text } }) => {
        console.log(text);
        // Process the text to extract the required fields
        // Example: setFieldValue("longeOD.esferico", extractedValue);
      });
    }
  };

  const InputMedicao = ({
    label,
    section,
  }: {
    label: string;
    section: keyof typeof initialValues;
  }) => (
    <div className="space-y-2">
      <p className="font-medium text-gray-300">{label}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-400">Esférico</label>
          <Field
            name={`${section}.esferico`}
            type="number"
            step="0.25"
            required
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-gray-700 text-white"
            inputMode="numeric"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400">Cilindro</label>
          <Field
            name={`${section}.cilindro`}
            type="number"
            step="0.25"
            required
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-gray-700 text-white"
            inputMode="numeric"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400">Eixo</label>
          <Field
            name={`${section}.eixo`}
            type="number"
            min="0"
            max="180"
            required
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-gray-700 text-white"
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
    <div className={`min-h-screen bg-gray-900 text-white`}>
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
                  <EyeOffIcon className="w-5 h-5" />
                  Ocultar Histórico
                </>
              ) : (
                <>
                  <EyeIcon className="w-5 h-5" />
                  Mostrar Histórico
                </>
              )}
            </button>
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Camera className="w-5 h-5" />
              {showCamera ? "Fechar Câmera" : "Abrir Câmera"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {mostrarConfirmacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">
                  Confirmar Exclusão
                </h2>
              </div>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja apagar todo o histórico? Esta ação não
                pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarConfirmacao(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmacao}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl p-6">
          <Formik initialValues={initialValues} onSubmit={calcularAdicao}>
            {({ resetForm, values }) => (
              <Form className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white border-b pb-2">
                    <EyeIcon className="inline-block w-5 h-5 mr-2" />
                    Visão de Longe
                  </h3>
                  <div className="space-y-4">
                    <InputMedicao label="OD (Olho Direito)" section="longeOD" />
                    <InputMedicao label="OE (Olho Esquerdo)" section="longeOE" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white border-b pb-2">
                    <EyeIcon className="inline-block w-5 h-5 mr-2" />
                    Visão de Perto
                  </h3>
                  <div className="space-y-4">
                    <InputMedicao label="OD (Olho Direito)" section="pertoOD" />
                    <InputMedicao label="OE (Olho Esquerdo)" section="pertoOE" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={!isFormValid(values)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      isFormValid(values)
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
                    onClick={() => limparFormulario(resetForm)}
                    className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Limpar formulário
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {showCamera && (
          <div className="mt-8">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full max-w-md rounded-lg shadow-lg"
            />
            <button
              onClick={captureImage}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Capturar Imagem
            </button>
          </div>
        )}

        {resultado !== null && (
          <div className="mt-8 p-4 bg-red-900 text-red-200 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold">
              Resultado da Adição: {resultado.toFixed(2)}
            </h2>
          </div>
        )}

        {mensagem && (
          <div className="mt-4 p-4 bg-green-900 text-green-200 rounded-lg shadow-lg">
            <p>{mensagem}</p>
          </div>
        )}

        {historico.length > 0 && mostrarHistorico && (
          <div className="w-full max-w-4xl mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Histórico de Cálculos
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copiarHistorico}
                  className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
            <div className="space-y-4 overflow-y-auto max-h-96">
              {historicoPaginado.map((calculo) => (
                <div
                  key={calculo.id}
                  className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-white">{calculo.nome}</h3>
                      <p className="text-sm text-gray-400">
                        {calculo.data} às {calculo.hora}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {calculo.receitaImagem && (
                        <a
                          href={calculo.receitaImagem}
                          download={`receita-${calculo.nome}.png`}
                          className="text-red-400 hover:text-red-500 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Receita
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-300">Visão de Longe</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">OD:</p>
                          <p className="text-sm text-gray-400">
                            Esf: {calculo.valores.longeOD.esferico} | Cil:{" "}
                            {calculo.valores.longeOD.cilindro} | Eixo:{" "}
                            {calculo.valores.longeOD.eixo}°
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">OE:</p>
                          <p className="text-sm text-gray-400">
                            Esf: {calculo.valores.longeOE.esferico} | Cil:{" "}
                            {calculo.valores.longeOE.cilindro} | Eixo:{" "}
                            {calculo.valores.longeOE.eixo}°
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-300">Visão de Perto</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm font-medium">OD:</p>
                          <p className="text-sm text-gray-400">
                            Esf: {calculo.valores.pertoOD.esferico} | Cil:{" "}
                            {calculo.valores.pertoOD.cilindro} | Eixo:{" "}
                            {calculo.valores.pertoOD.eixo}°
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">OE:</p>
                          <p className="text-sm text-gray-400">
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
                <span className="px-4 py-2 mx-1 text-gray-700 dark:text-white">
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
