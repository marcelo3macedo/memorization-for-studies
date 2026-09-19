export interface InlineButton {
  text: string;
  data: string;
}

/** Monta o reply_markup de teclado inline do Telegram a partir de linhas de botões. */
export function inlineKeyboard(rows: InlineButton[][]) {
  return {
    inline_keyboard: rows.map((row) => row.map((button) => ({ text: button.text, callback_data: button.data }))),
  };
}
