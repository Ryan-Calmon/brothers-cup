import { z } from "zod";

const TAMANHOS_UNIFORME = [
  "PP Masculino",
  "P Masculino",
  "M Masculino",
  "G Masculino",
  "GG Masculino",
  "XG Masculino",
  "PP Feminino",
  "P Feminino",
  "M Feminino",
  "G Feminino",
  "GG Feminino",
  "XG Feminino",
];

const CATEGORIAS = [
  "Feminino Escolinha",
  "Masculino Escolinha",
  "Feminino Iniciante",
  "Misto Escolinha",
  "Misto Iniciante",
  "Misto Intermediário",
  "Masculino Iniciante",
  "Masculino Intermediário",
];

export const inscricaoSchema = z.object({
  representante: z
    .string()
    .min(3, "Nome do representante deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  parceiro: z
    .string()
    .min(3, "Nome do parceiro deve ter pelo menos 3 caracteres")
    .max(100, "Nome muito longo"),
  celular: z
    .string()
    .min(10, "Celular deve ter pelo menos 10 dígitos")
    .max(15, "Celular inválido")
    .regex(/^[\d()+ -]+$/, "Formato de celular inválido"),
  instagramRepresentante: z
    .string()
    .min(1, "Instagram do representante é obrigatório"),
  instagramParceiro: z
    .string()
    .min(1, "Instagram do parceiro é obrigatório"),
  ctRepresentante: z.string().optional().default(""),
  ctParceiro: z.string().optional().default(""),
  uniformeRepresentante: z
    .string()
    .refine((v) => TAMANHOS_UNIFORME.includes(v), "Selecione um tamanho válido"),
  uniformeParceiro: z
    .string()
    .refine((v) => TAMANHOS_UNIFORME.includes(v), "Selecione um tamanho válido"),
  categoria: z
    .string()
    .refine((v) => CATEGORIAS.includes(v), "Selecione uma categoria válida"),
  aceitarTermos: z
    .boolean()
    .refine((v) => v === true, "Você deve aceitar os Termos e Condições"),
});

export { TAMANHOS_UNIFORME, CATEGORIAS };
