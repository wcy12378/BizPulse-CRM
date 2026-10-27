import { LOGOTIPO, SIMBOLO } from "@/lib/branding/desenho";
import { cn } from "@/lib/utils";

type Props = {
  readonly nome: string;
  readonly className?: string;
  readonly superficieEscura?: boolean;
  readonly decorativo?: boolean;
};

const CORES_MARCA = {
  simbolo: "fill-[#806943] dark:fill-[#c6ab79]",
  traco: "fill-[#1e1c18] dark:fill-[#f0ede6]",
  nome: "fill-[#1e1c18] dark:fill-[#f0ede6]",
} as const;
const CORES_MARCA_ESCURO = {
  simbolo: "fill-[#c6ab79]",
  traco: "fill-[#f0ede6]",
  nome: "fill-[#f0ede6]",
} as const;
export const CLASSES_DE_COR = CORES_MARCA;

function acessibilidade(nome: string, decorativo: boolean) {
  return decorativo
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": nome } as const);
}

function Marca({ nome, className, decorativo = false, superficieEscura = false, completa = false }: Props & {
  readonly completa?: boolean;
}) {
  const classes = superficieEscura ? CORES_MARCA_ESCURO : CORES_MARCA;
  const paths = completa ? LOGOTIPO.simbolo.paths : SIMBOLO.paths;

  return (
    <svg
      viewBox={completa ? LOGOTIPO.viewBox : SIMBOLO.viewBox}
      className={cn("shrink-0", className)}
      {...acessibilidade(nome, decorativo)}
    >
      <g fillRule="evenodd">
        <path d={paths[0]} className={classes.simbolo} />
        <path d={paths[1]} className={classes.traco} />
      </g>
      {completa && (
        <text
          x={LOGOTIPO.nome.x}
          y={LOGOTIPO.nome.y}
          className={classes.nome}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Microsoft YaHei', sans-serif"
          fontSize="31"
          fontWeight="650"
          letterSpacing="1"
        >
          {nome}
        </text>
      )}
    </svg>
  );
}

/** The standalone symbol used in the collapsed navigation rail. */
export function SimboloDoProduto(props: Props) {
  return <Marca {...props} />;
}

/** Symbol and live product name for the expanded navigation rail. */
export function LogotipoDoProduto(props: Props) {
  return <Marca {...props} completa />;
}
