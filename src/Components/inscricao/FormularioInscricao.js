import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { IoShirt } from "react-icons/io5";
import { CiInstagram } from "react-icons/ci";
import { MdOutlineStadium, MdPayment } from "react-icons/md";
import { BiCategoryAlt } from "react-icons/bi";
import { inscricaoSchema, TAMANHOS_UNIFORME, CATEGORIAS } from "../../schemas/inscricao";
import { criarInscricao, checkVagas } from "../../services/api";
import { Card, Button, Input, Select, Spinner } from "../../Components/ui";

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 text-brand-300 mb-3">
      <Icon className="w-5 h-5" />
      <h3 className="text-base font-semibold m-0">{title}</h3>
    </div>
  );
}

export default function FormularioInscricao() {
  const navigate = useNavigate();
  const [vagasRestantes, setVagasRestantes] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [segundaInscricao, setSegundaInscricao] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      representante: "",
      parceiro: "",
      celular: "",
      instagramRepresentante: "",
      instagramParceiro: "",
      ctRepresentante: "",
      ctParceiro: "",
      uniformeRepresentante: "",
      uniformeParceiro: "",
      categoria: "",
      aceitarTermos: false,
    },
  });

  const categoriaSelecionada = watch("categoria");

  const checkVagasDisponiveis = useCallback(async (categoria) => {
    if (!categoria || !CATEGORIAS.includes(categoria)) {
      setVagasRestantes(null);
      return;
    }
    try {
      const data = await checkVagas(categoria);
      setVagasRestantes(data.vagas);
    } catch {
      setVagasRestantes(null);
    }
  }, []);

  useEffect(() => {
    checkVagasDisponiveis(categoriaSelecionada);
  }, [categoriaSelecionada, checkVagasDisponiveis]);

  const isCategoriaSemVagas = vagasRestantes === 0;
  const temPoucasVagas =
    vagasRestantes !== null && vagasRestantes > 0 && vagasRestantes <= 6;

  const getValorInscricao = () => (formaPagamento === "cartao" ? 295 : 280);

  const onSubmit = async (data) => {
    if (isCategoriaSemVagas || segundaInscricao) return;
    setSubmitError("");

    try {
      const payload = {
        ...data,
        forma_pagamento: formaPagamento,
        valor_inscricao: getValorInscricao(),
      };

      const result = await criarInscricao(payload);

      if (result.init_point) {
        setIsRedirecting(true);
        window.location.href = result.init_point;
      } else if (result.sandbox_init_point) {
        setIsRedirecting(true);
        window.location.href = result.sandbox_init_point;
      } else {
        setSubmitError("Erro: URL de pagamento não encontrada. Tente novamente.");
      }
    } catch (err) {
      setSubmitError(err.message || "Erro ao processar inscrição. Tente novamente.");
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-brand-200 text-lg animate-pulse">
          Redirecionando para o pagamento...
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-2xl p-6 md:p-8 mt-8 mb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaTrophy className="text-brand-400 text-2xl" />
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Formulário de Inscrição
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Dupla */}
          <div className="space-y-4">
            <SectionHeader icon={IoMdPeople} title="Dados da Dupla" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Representante *"
                placeholder="Nome completo"
                error={errors.representante?.message}
                {...register("representante")}
              />
              <Input
                label="Nome do Parceiro *"
                placeholder="Nome completo"
                error={errors.parceiro?.message}
                {...register("parceiro")}
              />
            </div>
            <Input
              label="Celular do Representante *"
              placeholder="(21) 99999-9999"
              error={errors.celular?.message}
              {...register("celular")}
            />
          </div>

          {/* Instagram */}
          <div className="space-y-4">
            <SectionHeader icon={CiInstagram} title="Instagram" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="@ do Representante *"
                placeholder="@usuario"
                error={errors.instagramRepresentante?.message}
                {...register("instagramRepresentante")}
              />
              <Input
                label="@ do Parceiro *"
                placeholder="@usuario"
                error={errors.instagramParceiro?.message}
                {...register("instagramParceiro")}
              />
            </div>
          </div>

          {/* CTs */}
          <div className="space-y-4">
            <SectionHeader icon={MdOutlineStadium} title="CTs" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CT do Representante"
                placeholder="CT do Representante"
                {...register("ctRepresentante")}
              />
              <Input
                label="CT do Parceiro"
                placeholder="CT do Parceiro"
                {...register("ctParceiro")}
              />
            </div>
          </div>

          {/* Uniformes */}
          <div className="space-y-4">
            <SectionHeader icon={IoShirt} title="Tamanho dos Uniformes" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tamanho - Representante *"
                error={errors.uniformeRepresentante?.message}
                {...register("uniformeRepresentante")}
              >
                <option value="">Selecione o tamanho</option>
                {TAMANHOS_UNIFORME.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              <Select
                label="Tamanho - Parceiro *"
                error={errors.uniformeParceiro?.message}
                {...register("uniformeParceiro")}
              >
                <option value="">Selecione o tamanho</option>
                {TAMANHOS_UNIFORME.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-3">
            <SectionHeader icon={BiCategoryAlt} title="Categoria *" />
            <Select error={errors.categoria?.message} {...register("categoria")}>
              <option value="">Selecione a categoria</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            {temPoucasVagas && (
              <p className="text-amber-400 text-sm font-medium">
                ⚠️ Restam apenas {vagasRestantes} vagas nesta categoria!
              </p>
            )}
            {isCategoriaSemVagas && (
              <p className="text-red-400 text-sm font-semibold">
                ❌ Não há mais vagas nesta categoria.
              </p>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div className="space-y-3">
            <SectionHeader icon={MdPayment} title="Forma de Pagamento" />
            <Select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option value="pix">PIX — R$ 280,00</option>
              <option value="cartao">Cartão de Crédito — R$ 295,00</option>
            </Select>
            <p className="text-brand-200/60 text-xs">
              {formaPagamento === "pix"
                ? "Pagamento instantâneo via PIX"
                : "Cartão de crédito com taxa administrativa inclusa"}
            </p>
          </div>

          {/* Segunda Inscrição */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-400 rounded"
                checked={segundaInscricao}
                onChange={() => setSegundaInscricao(!segundaInscricao)}
              />
              <span className="text-sm text-brand-200">Segunda inscrição</span>
            </label>
            {segundaInscricao && (
              <p className="text-red-400 text-sm">
                Para sua segunda inscrição, nos chame no direct do Instagram!
              </p>
            )}
          </div>

          {/* Termos e Condições */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 accent-brand-400 rounded"
                {...register("aceitarTermos")}
              />
              <span className="text-sm text-brand-200">
                Aceito os{" "}
                <a
                  href="/docs/Termos.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 underline"
                >
                  Termos e Condições
                </a>
              </span>
            </label>
            {errors.aceitarTermos && (
              <p className="text-red-400 text-xs">{errors.aceitarTermos.message}</p>
            )}
          </div>

          {/* Errors */}
          {submitError && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            disabled={isCategoriaSemVagas || segundaInscricao}
            className="w-full"
          >
            {isSubmitting ? "Processando..." : `Finalizar Inscrição — R$ ${getValorInscricao()},00`}
          </Button>
        </form>
      </Card>
    </div>
  );
}
