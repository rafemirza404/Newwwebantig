/// <reference types="vite/client" />

// Wistia video player custom element declaration
declare namespace JSX {
  interface IntrinsicElements {
    'wistia-player': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'media-id': string;
        aspect?: string;
      },
      HTMLElement
    >;
  }
}
