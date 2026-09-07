# ☁️ My Cloud - Облачное хранилище

Веб-приложение для хранения и обмена файлами.

---

## Демо

http://194.67.100.75/

---

## Функциональность

### Пользователи
- Регистрация с валидацией (логин, email, пароль)
- Аутентификация (вход/выход) с JWT
- Разграничение прав: обычный пользователь / администратор

### Файлы
- Загрузка с комментариями
- Скачивание, переименование, удаление
- Изменение комментария
- Публичная ссылка для скачивания без авторизации

### Администратор
- Список всех пользователей
- Назначение прав администратора
- Удаление пользователей
- Просмотр файлов любого пользователя

---

## Технологии

**Бэкенд:** Python 3.14, Django 6.1.1, Django REST Framework, PostgreSQL, JWT  
**Фронтенд:** React 18, Redux Toolkit, React Router, Axios, CSS

---

## Структура проекта
my-cloud-diplom-/
├── apps/
│ ├── users/ # Пользователи и авторизация
│ └── files/ # Файловое хранилище
├── frontend/ # React приложение
│ └── src/
│ ├── pages/ # Страницы
│ ├── components/ # Компоненты
│ ├── store/ # Redux
│ └── styles/ # CSS
├── mycloud_backend/ # Настройки Django
├── manage.py
|── README.md
├── requirements.txt
└── .env

## Развертывание на VPS

### 1. Подключение к серверу
```bash
ssh root@194.67.100.75

2. Клонирование проекта
bash
git clone https://github.com/stanislav2602/my-cloud-diplom-.git
cd my-cloud-diplom-

3. Настройка бэкенда
bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Создать файл .env:

bash
cat > .env << EOF
SECRET_KEY=ваш_секретный_ключ
DB_NAME=mycloud
DB_USER=root
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
EOF

4. Настройка базы данных
bash
sudo -u postgres psql

Выполнить SQL-запросы:
sql
CREATE DATABASE mycloud;
CREATE USER root WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE mycloud TO root;
\q

5. Миграции и суперпользователь
bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser

6. Сборка фронтенда
bash
cd frontend
npm install
npm run build
cp -r build/* /var/www/mycloud/
cd ..

7. Настройка Nginx
bash
cat > /etc/nginx/sites-available/mycloud << 'EOF'
server {
    listen 80;
    server_name 194.67.100.75;

    location / {
        root /var/www/mycloud;
        try_files $uri /index.html;
    }

    location /static/ {
        alias /var/www/mycloud/static/;
        autoindex off;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

bash
ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

8. Запуск сервера
bash
gunicorn --workers 3 --bind 127.0.0.1:8000 mycloud_backend.wsgi:application

9. Локальный запуск

Бэкенд
bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Фронтенд
bash
cd frontend
npm install
npm start

 Тестовые данные
Роль
Администратор	admin	Admin123!
Пользователь	User	User123!
