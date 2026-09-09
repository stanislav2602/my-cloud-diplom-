import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchFiles, uploadFile, deleteFile, renameFile, updateComment } from '../store/slices/filesSlice';

const FilesPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { files, loading } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);

  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [newComment, setNewComment] = useState('');

  const userId = searchParams.get('user_id');
  const isViewingOther = userId && user?.is_admin;

  useEffect(() => {
    dispatch(fetchFiles(userId));
  }, [dispatch, userId]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Выберите файл');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Ошибка авторизации. Войдите заново.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('comment', comment);

      const response = await fetch(`${process.env.REACT_APP_API_URL}files/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки');
      }

      const result = await response.json();
      dispatch(uploadFile.fulfilled(result));
      setSelectedFile(null);
      setComment('');
      document.getElementById('fileInput').value = '';
      alert('Файл успешно загружен!');
    } catch (error) {
      alert('Ошибка при загрузке файла: ' + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Удалить файл?')) {
      await dispatch(deleteFile(fileId));
    }
  };

  const handleRename = async (fileId) => {
    if (!newName.trim()) return;
    await dispatch(renameFile({ fileId, newName }));
    setEditingFile(null);
    setNewName('');
  };

  const handleCommentUpdate = async (fileId) => {
    await dispatch(updateComment({ fileId, comment: newComment }));
    setEditingComment(null);
    setNewComment('');
  };

  const handleDownload = async (fileId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Ошибка авторизации');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}files/${fileId}/download/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка скачивания');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `file_${fileId}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Ошибка при скачивании файла');
      console.error(error);
    }
  };

  const copyToClipboard = (token) => {
    const url = `${process.env.REACT_APP_API_URL}files/public/${token}/`;
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована! Отправьте её кому угодно.');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2 className="card-title">
              {isViewingOther ? 'Файлы пользователя' : 'Мои файлы'}
            </h2>
            
            {!isViewingOther && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#0d0d0d', borderRadius: '4px', border: '1px solid #2a2a2a' }}>
                <h4 style={{ color: '#ff6b00' }}>Загрузить файл</h4>
                <div className="row" style={{ alignItems: 'center' }}>
                  <div className="col" style={{ flex: 2 }}>
                    <input
                      id="fileInput"
                      type="file"
                      className="form-control-file"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Комментарий"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ background: '#0d0d0d', color: '#fff', border: '1px solid #333' }}
                    />
                  </div>
                  <div className="col" style={{ flex: 0.5 }}>
                    <button
                      type="button"
                      className="btn btn-upload"
                      onClick={handleUpload}
                      disabled={!selectedFile || loading}
                      style={{ width: '100%', background: '#ff6b00', color: '#ffffff' }}
                    >
                      {loading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                  </div>
                </div>
                {selectedFile ? (
                  <div style={{ marginTop: '10px', color: '#ff6b00' }}>
                    Выбран: {selectedFile.name} ({formatSize(selectedFile.size)})
                  </div>
                ) : (
                  <div className="file-not-selected" style={{ marginTop: '10px' }}>
                    Файл не выбран
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : files.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                {isViewingOther ? 'У этого пользователя нет файлов' : 'У вас пока нет файлов. Загрузите первый файл!'}
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Размер</th>
                    <th>Комментарий</th>
                    <th>Загружен</th>
                    <th>Скачан</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id}>
                      <td>
                        {editingFile === file.id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              style={{ width: '150px', background: '#0d0d0d', color: '#fff', border: '1px solid #333' }}
                            />
                            <button className="btn btn-success" onClick={() => handleRename(file.id)}>
                              Сохранить
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditingFile(null)}>
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <strong>{file.original_name}</strong>
                        )}
                      </td>
                      <td>{formatSize(file.size)}</td>
                      <td>
                        {editingComment === file.id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                              type="text"
                              className="form-control"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              style={{ width: '150px', background: '#0d0d0d', color: '#fff', border: '1px solid #333' }}
                            />
                            <button className="btn btn-success" onClick={() => handleCommentUpdate(file.id)}>
                              Сохранить
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditingComment(null)}>
                              Отмена
                            </button>
                          </div>
                        ) : (
                          file.comment || <span style={{ color: '#555' }}>Нет комментария</span>
                        )}
                      </td>
                      <td>{formatDate(file.uploaded_at)}</td>
                      <td>{file.downloaded_at ? formatDate(file.downloaded_at) : 'Не скачан'}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn btn-primary"
                            onClick={() => handleDownload(file.id)}
                          >
                            Скачать
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => {
                              setEditingFile(file.id);
                              setNewName(file.original_name);
                            }}
                          >
                            Переименовать
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingComment(file.id);
                              setNewComment(file.comment || '');
                            }}
                          >
                            Коммент
                          </button>
                          <button
                            className="btn btn-info"
                            onClick={() => copyToClipboard(file.public_token)}
                          >
                            Копировать ссылку
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(file.id)}
                          >
                            Удалить
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
      </div>
    </div>
  );
};

export default FilesPage;
