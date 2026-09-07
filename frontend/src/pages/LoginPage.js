import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) dispatch(clearError());
    setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setLoginError('Заполните все поля');
      return;
    }

    const result = await dispatch(login(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/files');
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col" style={{ maxWidth: '400px' }}>
          <div className="card">
            <h2 className="card-title">Вход в систему</h2>
            
            {(error || loginError) && (
              <div className="alert alert-error">
                {loginError || error?.error || 'Ошибка входа'}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Логин</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
