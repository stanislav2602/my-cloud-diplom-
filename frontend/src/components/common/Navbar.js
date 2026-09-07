import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">My Cloud</Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <span style={{ color: '#555' }}>Привет, {user?.full_name || user?.username}</span>
            {user?.is_admin && <Link to="/admin">Админ панель</Link>}
            <Link to="/files">Мои файлы</Link>
            <button onClick={handleLogout} className="btn btn-danger">Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register" className="btn btn-primary">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
