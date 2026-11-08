'use client';

import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Upload,
  Box,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  Camera,
  Layers,
  DollarSign,
  Tag,
  FileCode,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { CDN_SERVICE_URL } from '@/lib/api';

// Supported licenses
const LICENSES = [
  { value: 'CC0', label: 'CC0 — Public Domain', desc: 'No rights reserved, free for any use' },
  { value: 'CC-BY', label: 'CC-BY — Attribution', desc: 'Free with credit to creator' },
  { value: 'CC-BY-NC', label: 'CC-BY-NC — Non-Commercial', desc: 'Free for non-commercial projects' },
  { value: 'COMMERCIAL', label: 'COMMERCIAL — Paid License', desc: 'Exclusive or paid commercial rights' },
] as const;

const MAX_MODEL_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_PREVIEW_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_POSTER_SIZE = 1 * 1024 * 1024; // 1 MB

// Default Creator token for local dev & testing (until Member 1 finishes login API)
const DEV_CREATOR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiY3JlYXRvckBicm9rZW5kZXNpZ24uY29tIiwicm9sZSI6ImNyZWF0b3IiLCJpc19zZWxsZXIiOnRydWUsImlhdCI6MTc5NDEzNDkxMywiZXhwIjoxNzk2NzI2OTEzfQ.vNxWpDQCz6OQvjoigpuvV7FQOMxa8KgJxyI792gahS0';

export default function UploadPage() {
  // Model-viewer dynamic import for client-side WebGL
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    import('@google/model-viewer')
      .then(() => setModelViewerLoaded(true))
      .catch((err) => console.error('Failed to load @google/model-viewer:', err));
  }, []);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState<string>('CC0');
  const [isPaid, setIsPaid] = useState(false);
  const [priceUsd, setPriceUsd] = useState('5.00');

  // UI & Submission states
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{ id: string; file_hash: string } | null>(null);
  const [capturingPoster, setCapturingPoster] = useState(false);

  // Clean up object URLs on change
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
    };
  }, [fileUrl, posterPreviewUrl]);

  // Client-side GLB magic bytes validator
  const validateGlbHeaderClient = async (f: File): Promise<boolean> => {
    if (f.size < 12) return false;
    const slice = f.slice(0, 12);
    const buffer = await slice.arrayBuffer();
    const view = new DataView(buffer);
    const magic = view.getUint32(0, true);
    const version = view.getUint32(4, true);
    // 'glTF' in hex little-endian is 0x46546c67
    return magic === 0x46546c67 && version === 2;
  };

  const handleModelSelect = async (selected: File) => {
    setValidationError(null);
    setSubmitError(null);

    if (!selected.name.toLowerCase().endsWith('.glb')) {
      setValidationError('Please select a valid .glb (Binary glTF) file.');
      return;
    }

    if (selected.size > MAX_MODEL_SIZE) {
      setValidationError(`Model file is too large (${(selected.size / (1024 * 1024)).toFixed(1)} MB). Max limit is 50 MB.`);
      return;
    }

    const isValidGlb = await validateGlbHeaderClient(selected);
    if (!isValidGlb) {
      setValidationError('The selected file does not appear to be a valid glTF 2.0 Binary (.glb) file.');
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setFileUrl(objectUrl);

    // Auto-fill title from filename if empty
    if (!title) {
      const cleanName = selected.name.replace(/\.glb$/i, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleModelSelect(e.dataTransfer.files[0]);
    }
  };

  // Add tag
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagsInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagsInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Capture poster snapshot automatically via <model-viewer>.toBlob()
  const handleCapturePoster = async () => {
    if (!viewerRef.current || typeof viewerRef.current.toBlob !== 'function') {
      setValidationError('3D Viewer is not ready to capture poster yet.');
      return;
    }

    try {
      setCapturingPoster(true);
      const blob: Blob | null = await viewerRef.current.toBlob({ idealAspect: true });
      if (!blob) throw new Error('Could not capture frame from 3D viewer');

      const posterBlobFile = new File([blob], `${title || 'model'}-poster.webp`, { type: 'image/webp' });
      setPosterFile(posterBlobFile);
      if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
      setPosterPreviewUrl(URL.createObjectURL(posterBlobFile));
    } catch (err: any) {
      setValidationError(`Failed to capture poster: ${err.message}`);
    } finally {
      setCapturingPoster(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setValidationError('Please upload a 3D model file (.glb).');
      return;
    }
    if (!title.trim()) {
      setValidationError('Model title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('file', file);
      if (previewFile) formData.append('preview', previewFile);
      if (posterFile) formData.append('poster', posterFile);

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('license', license);

      const priceCents = isPaid ? Math.round(parseFloat(priceUsd || '0') * 100) : 0;
      formData.append('price_cents', String(priceCents));
      formData.append('currency', 'USD');

      // Retrieve auth token if available (or use DEV_CREATOR_TOKEN for testing)
      const token = (typeof window !== 'undefined' ? localStorage.getItem('token') : null) || DEV_CREATOR_TOKEN;

      const res = await fetch(`${CDN_SERVICE_URL}/api/models`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to upload model. Please check your inputs.');
      }

      setUploadSuccess({
        id: data.model?.id || 'unknown',
        file_hash: data.model?.file_hash || 'uploaded',
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileUrl(null);
    setPreviewFile(null);
    setPosterFile(null);
    setPosterPreviewUrl(null);
    setTitle('');
    setDescription('');
    setTags([]);
    setLicense('CC0');
    setIsPaid(false);
    setPriceUsd('5.00');
    setUploadSuccess(null);
    setSubmitError(null);
    setValidationError(null);
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono tracking-wider text-white/70 uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Creator Upload Portal
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Upload 3D Asset</h1>
          <p className="mt-2 text-sm text-white/60">
            Publish your glTF 2.0 Binary (.glb) model to the global 3D CDN repository for developers to embed.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {uploadSuccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center backdrop-blur">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">Model Published Successfully!</h2>
            <p className="mt-2 text-sm text-white/70">
              Your 3D model has been processed, verified, and stored with Content-Addressable SHA-256 fingerprint:
            </p>
            <div className="mx-auto mt-4 max-w-md rounded-lg border border-white/10 bg-black/60 p-3 font-mono text-xs text-white/80 select-all">
              {uploadSuccess.file_hash}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Upload Another Model
              </button>
              <Link
                href={`/models/${uploadSuccess.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/85 transition-colors"
              >
                View in Gallery <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: 3D File Upload & Live Viewer */}
            <div className="space-y-6 lg:col-span-6">
              {/* Dropzone / 3D Preview Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : fileUrl
                    ? 'border-white/20 bg-black/60'
                    : 'border-white/15 bg-white/[0.02] hover:border-white/30'
                }`}
              >
                {fileUrl ? (
                  <div className="relative h-[380px] w-full">
                    {modelViewerLoaded ? (
                      <model-viewer
                        ref={viewerRef}
                        src={fileUrl}
                        alt="Uploaded 3D Preview"
                        auto-rotate
                        camera-controls
                        shadow-intensity="1"
                        style={{ width: '100%', height: '100%', backgroundColor: '#050505' }}
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-sm text-white/50">
                        Loading 3D Canvas...
                      </div>
                    )}

                    {/* Action buttons overlay inside 3D viewer */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-lg bg-black/80 px-3 py-2 backdrop-blur border border-white/10">
                      <div className="flex items-center gap-2 truncate text-xs text-white/80">
                        <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="truncate">{file?.name}</span>
                        <span className="text-white/40">({(file?.size! / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCapturePoster}
                          disabled={capturingPoster}
                          title="Generate poster snapshot from current 3D angle"
                          className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
                        >
                          <Camera className="h-3 w-3" />
                          {capturingPoster ? 'Capturing...' : 'Capture Poster'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setFileUrl(null);
                          }}
                          className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-8 text-center">
                    <input
                      type="file"
                      accept=".glb,model/gltf-binary"
                      className="hidden"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleModelSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/5 text-white/80 group-hover:scale-105 transition-transform">
                      <Box className="h-8 w-8 text-blue-400" />
                    </div>
                    <span className="mt-4 text-base font-medium text-white">Click or drag & drop 3D model</span>
                    <span className="mt-1 text-xs text-white/50">Supports Binary glTF 2.0 (.glb) up to 50 MB</span>
                    <div className="mt-4 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                      Browse Files
                    </div>
                  </label>
                )}
              </div>

              {/* Poster & Preview Model Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Poster Snapshot / Upload */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-white/80 mb-2">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-purple-400" /> Poster Cover
                    </span>
                    <span className="text-[11px] text-white/40">&lt; 1 MB</span>
                  </div>

                  {posterPreviewUrl ? (
                    <div className="relative h-28 w-full overflow-hidden rounded-lg border border-white/15 bg-black">
                      <img src={posterPreviewUrl} alt="Poster preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreviewUrl(null);
                        }}
                        className="absolute top-1 right-1 rounded bg-black/70 p-1 text-xs text-white/70 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 p-2 text-center hover:bg-white/10 transition-colors">
                      <input
                        type="file"
                        accept="image/webp,image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const p = e.target.files[0];
                            if (p.size > MAX_POSTER_SIZE) {
                              setValidationError('Poster image exceeds 1 MB limit.');
                              return;
                            }
                            setPosterFile(p);
                            setPosterPreviewUrl(URL.createObjectURL(p));
                          }
                        }}
                      />
                      <Camera className="h-5 w-5 text-white/40 mb-1" />
                      <span className="text-xs text-white/70">Upload image or click "Capture Poster"</span>
                    </label>
                  )}
                </div>

                {/* Optional Lightweight Preview Model (for Paid assets) */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between text-xs font-medium text-white/80 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-emerald-400" /> Preview GLB
                    </span>
                    <span className="text-[11px] text-white/40">&lt; 5 MB</span>
                  </div>

                  {previewFile ? (
                    <div className="flex h-28 w-full flex-col justify-center rounded-lg border border-white/15 bg-black/60 p-3 text-xs">
                      <span className="truncate font-medium text-white">{previewFile.name}</span>
                      <span className="text-white/40">{(previewFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <button
                        type="button"
                        onClick={() => setPreviewFile(null)}
                        className="mt-2 text-left text-xs text-red-400 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 p-2 text-center hover:bg-white/10 transition-colors">
                      <input
                        type="file"
                        accept=".glb,model/gltf-binary"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const pf = e.target.files[0];
                            if (pf.size > MAX_PREVIEW_SIZE) {
                              setValidationError('Preview file exceeds 5 MB limit.');
                              return;
                            }
                            setPreviewFile(pf);
                          }
                        }}
                      />
                      <Upload className="h-5 w-5 text-white/40 mb-1" />
                      <span className="text-xs text-white/70">Optional preview GLB</span>
                      <span className="text-[11px] text-white/40">For sample rotation</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Metadata Form */}
            <div className="space-y-5 lg:col-span-6">
              {/* Validation / Submit Alerts */}
              {validationError && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Model Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Drone MK-II"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell developers about polygon count, materials, animation rigs, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Tags (Press Enter or comma to add)
                </label>
                <div className="rounded-lg border border-white/15 bg-white/5 p-2">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-0.5 text-xs text-white"
                      >
                        <Tag className="h-3 w-3 text-blue-400" />
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="ml-1 text-white/50 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "e.g. character, weapon, vehicle, pbr" : "Add more tags..."}
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-transparent px-1.5 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* License Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  License & Usage
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-white/50 focus:outline-none"
                >
                  {LICENSES.map((lic) => (
                    <option key={lic.value} value={lic.value}>
                      {lic.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/40">
                  {LICENSES.find((l) => l.value === license)?.desc}
                </p>
              </div>

              {/* Pricing: Free vs Paid */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">Pricing Model</span>
                    <p className="text-xs text-white/50">Allow free embed or sell with access key</p>
                  </div>
                  <div className="inline-flex rounded-lg border border-white/15 bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        !isPaid ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPaid(true)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        isPaid ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Paid
                    </button>
                  </div>
                </div>

                {isPaid && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <label className="block text-xs text-white/60 mb-1">Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.50"
                        value={priceUsd}
                        onChange={(e) => setPriceUsd(e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-3 py-2 text-sm text-white focus:border-white/50 focus:outline-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-white/40">
                      Buyers receive an <code className="text-white/70">embed_key</code> to stream this model on their domains.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying & Uploading to CDN...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Publish 3D Asset
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
