/** Generated from app/globals.css by extrairRegua(). */

import type { Regua } from "./contraste";

export const REGUA_DO_PRODUTO: Regua = {
  "rampaDoProduto": [
    "#faf8f3",
    "#f3efe5",
    "#e6ddca",
    "#d6c6a7",
    "#b99f74",
    "#9b8057",
    "#806943",
    "#6a5435",
    "#51412a",
    "#392f20",
    "#261f16"
  ],
  "claro": {
    "nome": "claro",
    "base": [
      {
        "chave": "--color-bg",
        "hex": "#f8f7f3"
      },
      {
        "chave": "--color-surface",
        "hex": "#ffffff"
      },
      {
        "chave": "--color-surface-elevated",
        "hex": "#f2f0e9"
      }
    ],
    "tingidas": [
      {
        "chave": "--color-accent-soft",
        "fonte": {
          "tipo": "grau",
          "indice": 1,
          "alfa": 1
        }
      }
    ],
    "papeis": [
      {
        "token": "--color-accent",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 6,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "--color-accent-fg",
        "tipo": "texto",
        "fonte": {
          "tipo": "frenteCalculada",
          "sobre": {
            "tipo": "grau",
            "indice": 6,
            "alfa": 1
          }
        },
        "contra": [
          {
            "tipo": "grau",
            "indice": 6,
            "alfa": 1
          }
        ]
      },
      {
        "token": "--color-accent-hover",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 7,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "--ring",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 5,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "::selection/color",
        "tipo": "texto",
        "fonte": {
          "tipo": "grau",
          "indice": 10,
          "alfa": 1
        },
        "contra": [
          {
            "tipo": "grau",
            "indice": 2,
            "alfa": 1
          }
        ]
      },
      {
        "token": ":focus-visible/outline",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 5,
          "alfa": 1
        },
        "contra": null
      }
    ],
    "semanticas": [
      {
        "nome": "success",
        "hex": "#5e8b62"
      },
      {
        "nome": "warning",
        "hex": "#9c6321"
      },
      {
        "nome": "error",
        "hex": "#a94431"
      },
      {
        "nome": "info",
        "hex": "#506e8a"
      }
    ],
    "neutros": [
      "#fbfaf7",
      "#f3f1eb",
      "#e8e5dd",
      "#d3cfc4",
      "#b2ada2",
      "#898378",
      "#69645b",
      "#4a463f",
      "#302d28",
      "#1e1c18",
      "#11100e"
    ],
    "indices": {
      "accent": 6,
      "hover": 7,
      "soft": 1
    },
    "alfaDoSoft": 1
  },
  "escuro": {
    "nome": "escuro",
    "base": [
      {
        "chave": "--color-bg",
        "hex": "#171613"
      },
      {
        "chave": "--color-surface",
        "hex": "#211f1a"
      },
      {
        "chave": "--color-surface-elevated",
        "hex": "#2a2822"
      }
    ],
    "tingidas": [
      {
        "chave": "--color-accent-soft",
        "fonte": {
          "tipo": "literal",
          "hex": "#b99f74",
          "alfa": 0.16
        }
      }
    ],
    "papeis": [
      {
        "token": "--color-accent",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 4,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "--color-accent-fg",
        "tipo": "texto",
        "fonte": {
          "tipo": "frenteCalculada",
          "sobre": {
            "tipo": "grau",
            "indice": 4,
            "alfa": 1
          }
        },
        "contra": [
          {
            "tipo": "grau",
            "indice": 4,
            "alfa": 1
          }
        ]
      },
      {
        "token": "--color-accent-hover",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 3,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "--ring",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 4,
          "alfa": 1
        },
        "contra": null
      },
      {
        "token": "[data-theme=\"dark\"] ::selection/color",
        "tipo": "texto",
        "fonte": {
          "tipo": "grau",
          "indice": 0,
          "alfa": 1
        },
        "contra": [
          {
            "tipo": "grau",
            "indice": 7,
            "alfa": 1
          }
        ]
      },
      {
        "token": "[data-theme=\"dark\"] :focus-visible/outline-color",
        "tipo": "componente",
        "fonte": {
          "tipo": "grau",
          "indice": 4,
          "alfa": 1
        },
        "contra": null
      }
    ],
    "semanticas": [
      {
        "nome": "success",
        "hex": "#85a98a"
      },
      {
        "nome": "warning",
        "hex": "#cf8d4a"
      },
      {
        "nome": "error",
        "hex": "#c8765d"
      },
      {
        "nome": "info",
        "hex": "#7e9fbb"
      }
    ],
    "neutros": [
      "#f0ede6",
      "#e1ddd3",
      "#cbc5b9",
      "#b3ada1",
      "#a9a397",
      "#655f55",
      "#38352e",
      "#2a2822",
      "#211f1a",
      "#171613",
      "#100f0c"
    ],
    "indices": {
      "accent": 4,
      "hover": 3,
      "soft": null
    },
    "alfaDoSoft": 0.16
  }
};
