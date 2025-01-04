/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GRAPHQL_API_URL: string;
    readonly VITE_GRAPHQL_API_KEY: string;
    readonly VITE_PRODUCTS_TABLE_NAME: string;
    readonly VITE_PRODUCT_TAXONOMY_TABLE_NAME: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  