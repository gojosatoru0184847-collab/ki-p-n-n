# Store-ready + Kiếm tiền thật (AdMob)

> Dự án hiện đang dùng **AdMob Test App ID** để bạn test. Trước khi release, hãy thay bằng ID thật.

## 1) Tạo AdMob App + Ad Units
- Tạo App trên AdMob (Android)
- Tạo các Ad Unit:
  - Rewarded (khuyên dùng)
  - Interstitial (tuỳ)
  - Banner (tuỳ)

## 2) Thay App ID trong AndroidManifest.xml
File: `app/src/main/AndroidManifest.xml`

Thay:
`ca-app-pub-3940256099942544~3347511713`
bằng App ID thật của bạn.

## 3) Thay Ad Unit ID trong AdManager.java
File: `app/src/main/java/com/adr/zombie/AdManager.java`

Thay Rewarded Ad Unit test:
`ca-app-pub-3940256099942544/5224354917`
bằng Unit ID thật.

## 4) Bật build release (AAB) để đăng Play Console
GitHub Actions đã build **APK + AAB** (nếu workflow bật).
- Play Console yêu cầu AAB cho app mới.

## 5) Chính sách
- Có màn hình/đoạn mô tả rõ "Xem quảng cáo để nhận thưởng"
- Không ép người chơi xem liên tục
- Reward nên có giới hạn (cooldown)

## 6) Ký app (tuỳ chọn)
Bạn có thể upload AAB signed bằng Play App Signing (khuyến nghị).
