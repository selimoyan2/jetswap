import { NotificationType, NotificationTemplateData } from './types';

export interface RenderedNotificationTemplate {
  title: string;
  message: string;
}

export function renderNotificationTemplate(
  type: NotificationType,
  data?: NotificationTemplateData
): RenderedNotificationTemplate {
  switch (type) {
    case NotificationType.NEW_OFFER: {
      const offered = data?.offeredCount;
      const requested = data?.requestedCount;
      let message = 'İlanınız için yeni bir takas teklifi aldınız.';
      if (typeof offered === 'number' && typeof requested === 'number') {
        message = `Bir teklif aldınız: ${offered} ürün karşılığında ${requested} ürün.`;
      }
      return {
        title: 'Yeni Takas Teklifi',
        message,
      };
    }

    case NotificationType.COUNTER_OFFER:
      return {
        title: 'Yeni Karşı Teklif',
        message: 'Teklifinize karşı teklif verildi.',
      };

    case NotificationType.OFFER_ACCEPTED:
      return {
        title: 'Teklif Kabul Edildi',
        message: 'Takas teklifiniz kabul edildi.',
      };

    case NotificationType.OFFER_REJECTED:
      return {
        title: 'Teklif Reddedildi',
        message: 'Takas teklifiniz reddedildi.',
      };

    case NotificationType.NEW_MESSAGE:
      return {
        title: 'Yeni Takas Mesajı',
        message: 'Takas teklifinizde yeni bir mesajınız var.',
      };

    case NotificationType.CONTACT_REVEALED:
      return {
        title: 'İletişim Bilgileri Açıldı',
        message: 'İki taraf da onayladı. İletişim bilgileri görüntülenebilir.',
      };

    case NotificationType.TRADE_COMPLETION_REQUEST:
      return {
        title: 'Takas Tamamlama Onayı',
        message: 'Karşı taraf takası tamamladığını bildirdi. Lütfen onaylayın.',
      };

    case NotificationType.TRADE_COMPLETED:
      return {
        title: 'Takas Tamamlandı',
        message: 'Takas başarıyla tamamlandı. Artık değerlendirme yapabilirsiniz.',
      };

    case NotificationType.NEW_REVIEW:
      return {
        title: 'Yeni Değerlendirme',
        message: 'Takasınız için yeni bir değerlendirme yapıldı.',
      };

    default:
      return {
        title: 'Bildirim',
        message: 'Yeni bir bildiriminiz var.',
      };
  }
}
