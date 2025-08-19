import { TelegramConfig } from '../types';

const TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '8040287359:AAENMuvZ_P_eEJORwspps8prRXedPO86diY',
  chatId: '961069492'
};

export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Telegram xabar yuborishda xato:', error);
    return false;
  }
};

export const sendDebtReminder = async (debtors: Array<{
  customerName: string;
  customerPhone: string;
  remainingDebt: number;
  dueDate: string;
}>): Promise<boolean> => {
  let message = '📢 <b>Ogohlantirish!</b>\n\n';
  message += 'Quyidagi mijozlarning qarz to\'lovi muddati ertaga tugaydi:\n\n';
  
  debtors.forEach(debtor => {
    message += `🧍‍♂️ <b>${debtor.customerName}</b>\n`;
    message += `📞 ${debtor.customerPhone}\n`;
    message += `💸 Qarzdorlik: ${debtor.remainingDebt.toLocaleString()} so'm\n`;
    message += `📅 Muddat: ${debtor.dueDate}\n\n`;
  });

  return await sendTelegramMessage(message);
};

export const sendTestMessage = async (): Promise<boolean> => {
  const testMessage = '🧪 <b>Sinov xabari</b>\n\nBuildPOS tizimi ishlayapti!';
  return await sendTelegramMessage(testMessage);
};
