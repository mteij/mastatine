/** Small inline icons for buttons. They follow the text colour and are hidden from screen readers (the label carries the meaning). */
const base = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const ChartIcon = () => (
  <svg {...base}>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </svg>
);
export const TrashIcon = () => (
  <svg {...base}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
);
export const ArrowLeftIcon = () => (
  <svg {...base}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const CheckIcon = () => (
  <svg {...base}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const ListIcon = () => (
  <svg {...base}>
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);
