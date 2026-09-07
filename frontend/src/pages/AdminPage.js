import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.is_admin) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const response = await api.get('users/');
      const usersWithFiles = await Promise.all(
        response.data.map(async (u) => {
          try {
            const filesResponse = await api.get(`files/?user_id=${u.id}`);
            return {
              ...u,
              file_count: filesResponse.data.length,
              total_size: filesResponse.data.reduce((sum, f) => sum + f.size, 0),
            };
          } catch {
            return { ...u, file_count: 0, total_size: 0 };
          }
        })
      );
      setUsers(usersWithFiles);
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId) => {
    if (!window.confirm('Изменить права администратора?')) return;
    try {
      await api.patch(`users/${userId}/toggle-admin/`);
      await loadUsers();
    } catch (err) {
      alert('Ошибка изменения прав');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Удалить пользователя ${username}?`)) return;
    try {
      await api.delete(`users/${userId}/delete/`);
      await loadUsers();
    } catch (err) {
      alert('Ошибка удаления пользователя');
    }
  };

  const handleViewUserFiles = (userId) => {
    navigate(`/files?user_id=${userId}`);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!user?.is_admin) {
    return (
      <div className="container">
        <div className="alert alert-error">
          Доступ запрещен. Требуются права администратора.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">Админ панель</h2>
        <p style={{ color: '#cccccc', marginBottom: '20px' }}>
          Управление пользователями системы
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Логин</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Админ</th>
                <th>Файлов</th>
                <th>Размер</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.full_name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.is_admin ? '✅ Да' : '❌ Нет'}</td>
                  <td>{u.file_count}</td>
                  <td>{formatSize(u.total_size)}</td>
                  <td>
                    <div className="actions-cell">
                      {u.id !== user.id && (
                        <>
                          <button
                            className="btn btn-warning"
                            onClick={() => handleToggleAdmin(u.id)}
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            {u.is_admin ? 'Снять админа' : 'Сделать админом'}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            Удалить
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-info"
                        onClick={() => handleViewUserFiles(u.id)}
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Файлы
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
