# ☁️ My Cloud - Облачное хранилище

Веб-приложение для хранения и обмена файлами.

## Ссылка на проект

## Функциональность

- Регистрация и авторизация пользователей
- Загрузка файлов с комментариями
- Скачивание файлов
- Переименование и удаление файлов
- Публичные ссылки для отправки файлов
- Админ-панель для управления пользователями

## Технологии

**Бэкенд:** Python, Django, Django REST Framework, PostgreSQL, JWT  
**Фронтенд:** React, Redux Toolkit, React Router, Axios

## Структура проекта

mycloud/
├── apps/
│ ├── users/ # Пользователи и авторизация
│ └── files/ # Файловое хранилище
├── frontend/ # React приложение
├── mycloud_backend/ # Настройки Django
├── media/ # Загруженные файлы
├── manage.py
├── requirements.txt
└── .env

## Запуск для разработки

```bash
# Бэкенд
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Фронтенд
cd frontend
npm install
npm start
