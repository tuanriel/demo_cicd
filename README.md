# Orbit Store — Demo CI/CD ("commit → giao diện đổi")

App React (Vite) — trang bán hàng đơn giản — dùng demo CI/CD Platform:
push code → webhook GitHub → backend trigger Jenkins → **build React** →
deploy ra nginx → mở **https://demo.orbitai.vn** thấy giao diện đổi.

```
demo-site/
├── src/
│   ├── App.jsx             ← đổi SITE_VERSION / BANNER ở đây để demo đổi UI
│   ├── App.css
│   ├── products.js         ← thêm/sửa sản phẩm cũng thấy đổi
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── .viettelcloud/workflows/
│   └── deploy.yml          ← PIPELINE: build React + deploy (logic ở đây)
├── docker-compose.demo.yml ← nginx (override riêng, KHÔNG đụng cicd-platform)
└── README.md
```

Ranh giới: **build + deploy = trong workflow**; **backend cicd-platform giữ
nguyên**; nginx là hạ tầng demo riêng qua file override; image Jenkins **không
bị sửa** (pipeline tự tải Node portable, cache trong `$HOME`).

---

## Chuẩn bị 1 lần

### 1. Đẩy repo lên GitHub
Provider tích hợp là **GitHub** (không phải GitLab):
```bash
cd demo-site
git init && git add . && git commit -m "orbit store v1"
git branch -M main
git remote add origin https://github.com/<user>/orbit-store.git
git push -u origin main
```

### 2. Dựng nginx + web root trên VPS
Tại thư mục `cicd-platform` trên VPS:
```bash
sudo mkdir -p /srv/demo-site && sudo chown 1000:1000 /srv/demo-site
echo '<h1>Cho deploy...</h1>' | sudo tee /srv/demo-site/index.html
docker compose -f docker-compose.yml -f ../demo-site/docker-compose.demo.yml up -d
```

### 3. Trỏ demo.orbitai.vn → VPS:8082
Làm giống hệt `apicicd.orbitai.vn` (DNS record + reverse-proxy/Cloudflare).
Mở thử `https://demo.orbitai.vn` → thấy "Cho deploy...".

---

## Kết nối repo vào platform (auth đang tắt → không cần token)

```bash
API=https://apicicd.orbitai.vn/api/v1

# 1. Liên kết GitHub (PAT cần scope: repo + admin:repo_hook)
curl -s -X POST $API/source-providers -H 'Content-Type: application/json' \
  -d '{"provider_type":"github","access_token":"ghp_xxx"}'          # → SP_ID

# 2. Map repo → webhook tự đăng ký
curl -s -X POST $API/source-providers/<SP_ID>/repositories \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"<user>/orbit-store"}'                           # → REPO_ID

# 3. Sync
curl -s -X POST $API/repositories/<REPO_ID>/sync                    # → PIPELINE_ID

# 4. Build thử thủ công (build ĐẦU TIÊN lâu hơn: tải Node + npm ci ~2-3 phút,
#    các build sau nhanh vì Node đã cache trong jenkins_home)
curl -s -X POST $API/pipelines/<PIPELINE_ID>/trigger -d '{}'        # → build_number

# 5. Theo dõi log build
curl -s $API/pipelines/<PIPELINE_ID>/builds/<NUMBER>/logs
```

Build SUCCESS → mở `https://demo.orbitai.vn` thấy Orbit Store **v1**.

---

## Demo "commit → đổi giao diện"

1. Sửa `src/App.jsx`: đổi `SITE_VERSION = "v2"`, đổi `BANNER`, hoặc sửa
   `src/products.js` (thêm sản phẩm, đổi giá).
2. `git commit -am "orbit store v2" && git push`
3. Webhook → build mới `trigger_type: "webhook"` tự chạy (build React lại).
4. Reload `https://demo.orbitai.vn` → giao diện đã đổi. 🎉

---

## Lưu ý / bẫy đã biết
- Build đầu chậm (tải Node + `npm ci`); sau đó nhanh nhờ cache `$HOME/.node`
  và npm cache trong `jenkins_home`.
- Yêu cầu VPS ra Internet được tới `nodejs.org` + npm registry (có sẵn, vì
  đã kéo được docker image/git).
- **Jenkins chết → API build trả 502** (build pure-proxy, không lưu DB).
- `runner: built-in` bắt buộc cho Jenkins compose (KHÔNG `jenkins-jenkins-agent`).
- Pipeline không có block `trigger:` sẽ chỉ chạy tay, webhook bỏ qua.
# demo_cicd
