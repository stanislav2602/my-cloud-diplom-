import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `files/?user_id=${userId}` : 'files/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadFile = createAsyncThunk(
  'files/uploadFile',
  async ({ file, comment }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('comment', comment);
      
      const response = await api.post('files/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await api.delete(`files/${fileId}/delete/`);
      return fileId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const renameFile = createAsyncThunk(
  'files/renameFile',
  async ({ fileId, newName }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`files/${fileId}/rename/`, { new_name: newName });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateComment = createAsyncThunk(
  'files/updateComment',
  async ({ fileId, comment }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`files/${fileId}/comment/`, { comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  files: [],
  loading: false,
  error: null,
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    clearFilesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file.id !== action.payload);
      })
      .addCase(renameFile.fulfilled, (state, action) => {
        const index = state.files.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const index = state.files.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      });
  },
});

export const { clearFilesError } = filesSlice.actions;
export default filesSlice.reducer;