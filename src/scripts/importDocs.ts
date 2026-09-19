import "dotenv/config";
import { importDocs } from "../database/importer/importDocs";

const summary = importDocs();

console.log(
  `Importação concluída: ${summary.inserted} card(s) novo(s), ${summary.skipped} já existente(s) ignorado(s), ${summary.filesProcessed} arquivo(s) processado(s).`,
);
