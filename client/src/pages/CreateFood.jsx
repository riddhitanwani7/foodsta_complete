import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFood, createFoodWithUrl } from '../services/api';
import BottomNav from '../components/BottomNav';

export default function CreateFood() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'file' | 'url'
  const [form, setForm] = useState({ name: '', description: '', cuisine: '', videoUrl: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
 const [isDragging, setIsDragging] = useState(false);
const [urlVideoError, setUrlVideoError] = useState('');
const [urlVideoOk, setUrlVideoOk] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('Only video files are allowed.');
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError('File too large. Max 100MB.');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Move URL validation INSIDE the else block below
  setError('');
  setSuccess('');
  setUploading(true);
  setProgress(0);

  try {
    if (uploadMode === 'file') {
      if (!file) { setError('Please select a video file.'); setUploading(false); return; }
      const formData = new FormData();
      formData.append('video', file);
      formData.append('name', form.name);
      formData.append('description', form.description);
      if (form.cuisine) formData.append('cuisine', form.cuisine);

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 85));
      }, 300);

      await createFood(formData);
      clearInterval(interval);
      setProgress(100);
    } else {
      // URL validation only here
      if (!form.videoUrl.trim()) { setError('Video URL is required.'); setUploading(false); return; }
      if (!urlVideoOk) { setError('Video URL could not be loaded. Please use a direct .mp4 link.'); setUploading(false); return; }
      
      await createFoodWithUrl({
        name: form.name,
        description: form.description,
        cuisine: form.cuisine,
        video: form.videoUrl,
      });
      setProgress(100);
    }

    setSuccess('Reel uploaded successfully! 🎉');
    setTimeout(() => navigate('/app'), 1500);
  } catch (err) {
    setError(err.response?.data?.message || 'Upload failed. Please try again.');
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="upload-container" style={{ overflowY: 'auto', height: '100dvh' }}>
      <div className="upload-card animate-fade-in">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            >
              <span className="icon icon-sm">arrow_back</span>
            </button>
            <h1 className="font-headline" style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Upload Reel
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Share your food with the world</p>
        </div>

        {/* Upload Mode Toggle */}
        <div className="role-selector" style={{ marginBottom: 24 }}>
          <button className={`role-btn ${uploadMode === 'url' ? 'active' : ''}`} onClick={() => { setUploadMode('url'); setUrlVideoError(''); setUrlVideoOk(false); }} type="button">
            <span className="icon icon-sm">link</span> Video URL
          </button>
          <button className={`role-btn ${uploadMode === 'file' ? 'active' : ''}`} onClick={() => { setUploadMode('file'); setUrlVideoError(''); setUrlVideoOk(false); }} type="button">
            <span className="icon icon-sm">upload_file</span> Upload File
          </button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && (
          <div style={{ padding: 12, background: 'rgba(0,219,233,0.1)', border: '1px solid rgba(0,219,233,0.25)', borderRadius: 8, color: 'var(--accent-cyan)', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Video input */}
          {uploadMode === 'file' ? (
            <div
              className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileRef.current?.click()}
              style={{ borderColor: isDragging ? 'var(--accent-pink)' : undefined, background: isDragging ? 'rgba(255,75,137,0.05)' : undefined }}
            >
              {preview ? (
                <div style={{ maxHeight: 220, overflow: 'hidden', borderRadius: 8, marginBottom: 10 }}>
                  <video src={preview} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} muted playsInline />
                </div>
              ) : (
                <span className="icon">video_call</span>
              )}
              <p>{file ? file.name : 'Tap or drag to upload a video'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>MP4, MOV, WebM · Max 100MB</p>
              <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          ) : (
  <div className="form-group" style={{ marginBottom: 20 }}>
    <label>Video URL</label>
    <input
      className="input-field"
      name="videoUrl"
      type="url"
      placeholder="https://example.com/video.mp4"
      value={form.videoUrl}
      onChange={(e) => {
        handleChange(e);
        setUrlVideoError('');
        setUrlVideoOk(false);
      }}
      required={uploadMode === 'url'}
    />
    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
      Must be a direct .mp4 / .webm / .ogg link. YouTube and Google Drive links will not work.
    </p>

    {/* Live preview + validation */}
    {form.videoUrl && (
      <div style={{ marginTop: 12 }}>
        <video
          key={form.videoUrl}
          src={form.videoUrl}
          muted
          playsInline
          controls
          style={{ width: '100%', maxHeight: 200, borderRadius: 8, background: '#000', display: 'block' }}
          onCanPlay={() => { setUrlVideoError(''); setUrlVideoOk(true); }}
          onError={() => {
            setUrlVideoError('Cannot load this URL. Use a direct .mp4 link (not YouTube/Drive).');
            setUrlVideoOk(false);
          }}
        />
        {urlVideoError && (
          <p style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: 6 }}>{urlVideoError}</p>
        )}
        {urlVideoOk && (
          <p style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem', marginTop: 6 }}>
            ✓ Video loaded successfully
          </p>
        )}
      </div>
    )}
  </div>
)}

          {/* Upload progress */}
          {uploading && (
            <div className="upload-progress" style={{ marginBottom: 16 }}>
              <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Food name */}
          <div className="form-group">
            <label>Food Name *</label>
            <input className="input-field" name="name" placeholder="e.g. Spicy Chicken Biryani" value={form.name} onChange={handleChange} required />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input-field"
              name="description"
              placeholder="Describe your dish..."
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>

          {/* Cuisine */}
          <div className="form-group">
            <label>Cuisine Type</label>
            <input className="input-field" name="cuisine" placeholder="e.g. Indian, Italian, Japanese" value={form.cuisine} onChange={handleChange} />
          </div>

          <button className="btn-neon" type="submit" disabled={uploading} style={{ width: '100%', marginTop: 8 }}>
            {uploading ? (
              <>
                <div className="loader-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {uploadMode === 'file' ? `Uploading... ${progress}%` : 'Publishing...'}
              </>
            ) : (
              <>
                <span className="icon icon-sm icon-filled">rocket_launch</span>
                Publish Reel
              </>
            )}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
