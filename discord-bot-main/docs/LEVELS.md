# Levels (Seviye Sistemi)

Bu belge projenin seviye sistemi özelliklerini açıklar ve nasıl yapılandırılacağını gösterir.

## Özellikler

- Mesaj başına XP kazanma (rastgele 5-10 XP), kullanıcı başına 60 saniye cooldown
- Seviye hesaplama: level = floor(sqrt(xp / 100))
- Lider tablosu (leaderboard)
- Per-guild ayar: Seviye sistemi sunucu bazında açılıp kapatılabilir (opt-out)
- Rol ödülleri: belirli seviyelere ulaşıldığında roller otomatik atanabilir
- Yöneticiler için `levels` (toggle/reset) ve `levels rewards` (add/remove/list) komutları

## Komutlar

Slash (yeni):
- `/level` — kendi (veya kullanıcı) seviyesini gösterir
- `/leaderboard [limit]` — lider tablosunu gösterir
- `/levels toggle` — (Admin) seviye sistemini aç/kapat
- `/levels reset` — (Admin) sunucu seviyelerini sıfırla- `levels announce` — (Admin) seviye atlama duyurularını yönetir (slash alt komut grubu)
Prefix:
- `!level [@user]` — seviye bilgisi
- `!levels toggle` — (Admin) aç/kapat
- `!levels reset` — (Admin) sıfırla

## Config
- `src/utils/leveling/levelConfig.js` veri deposunu tutar (`Database/db/levels/config.json` benzeri).
- Varsayılan olarak sistem aktiftir.
- Duyurular: `announceOnLevelUp` (bool, default true) ve `announceChannelId` (kanal idsi, default null) ile seviye atlama duyuruları yönetilebilir.


## Geliştirme Notları
- Rol ödülleri ve gelişmiş yönetim eklenecek.
- Testler: `tests/level/*` → LevelManager ve konfigürasyon testleri
