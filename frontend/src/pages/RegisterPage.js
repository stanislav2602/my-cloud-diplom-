import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    password2: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) dispatch(clearError());
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    const { username, email, password, password2 } = formData;

    if (!username.match(/^[A-Za-z][A-Za-z0-9]{3,19}$/)) {
      errors.username = 'Логин: только латиница и цифры, первый символ буква, 4-20 символов';
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      errors.email = 'Неверный формат email';
    }

    if (password.length < 6) {
      errors.password = 'Пароль должен быть не менее 6 символов';
    } else if (!password.match(/[A-Z]/)) {
      errors.password = 'Пароль должен содержать заглавную букву';
    } else if (!password.match(/[0-9]/)) {
      errors.password = 'Пароль должен содержать цифру';
    } else if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      errors.password = 'Пароль должен содержать специальный символ';
    }

    if (password !== password2) {
      errors.password2 = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await dispatch(register(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      alert('Регистрация прошла успешно! Теперь войдите в систему.');
      navigate('/login');
    }
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'center' }}>
        <div className="col" style={{ maxWidth: '500px' }}>
          <div className="card">
            <h2 className="card-title">Регистрация</h2>
            
            {error && (
              <div className="alert alert-error">
                {typeof error === 'string' ? error : JSON.stringify(error)}
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
                {validationErrors.username && (
                  <div className="error">{validationErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label>Полное имя</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {validationErrors.email && (
                  <div className="error">{validationErrors.email}</div>
                )}
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
                {validationErrors.password && (
                  <div className="error">{validationErrors.password}</div>
                )}
                <small style={{ color: '#666' }}>
                  Минимум 6 символов, заглавная буква, цифра, спецсимвол
                </small>
              </div>

              <div className="form-group">
                <label>Подтверждение пароля</label>
                <input
                  type="password"
                  name="password2"
                  className="form-control"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
                {validationErrors.password2 && (
                  <div className="error">{validationErrors.password2}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Загрузка...' : 'Зарегистрироваться'}
              </button>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center' }}>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
