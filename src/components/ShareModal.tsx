'use client';

import { useEffect, useRef, useState } from 'react';
import type { SharedSchema } from '@/types/sharedSchema';
import { downloadJson, isSchemaEmpty } from '@/lib/serializeSchema';

type Props = {
    open: boolean;
    onClose: () => void;
    schema: SharedSchema | null;
};

export default function ShareModal({ open, onClose, schema }: Props) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [shareUrl, setShareUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) {
            setShareUrl('');
            setError('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open || !schema) return null;

    const emptySchema = isSchemaEmpty(schema);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleCreateLink = async () => {
        if (emptySchema) {
            setError('Add at least one block before sharing.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/schemas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schema),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Failed to create link');

            const url = `${window.location.origin}/s/${data.id}`;
            setShareUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
    };

    const handleExport = () => {
        if (emptySchema) return;
        downloadJson(schema);
    };

    return (
        <div className="share-modal-backdrop" onClick={handleBackdropClick}>
            <div className="share-modal" ref={dialogRef} role="dialog" aria-modal="true">
                <button type="button" className="share-modal__close" onClick={onClose} aria-label="Close">
                    <i className="bi bi-x-lg" />
                </button>

                <h2 className="share-modal__title">Share schema</h2>

                <section className="share-modal__section">
                    <h3>Share link</h3>
                    <p className="share-modal__hint">
                        Anyone with the link will see the same schema.
                    </p>

                    {emptySchema && (
                        <p className="share-modal__error">
                            Add at least one block to the canvas before creating a link.
                        </p>
                    )}

                    <button
                        type="button"
                        className="share-modal__btn"
                        onClick={handleCreateLink}
                        disabled={loading || emptySchema}
                    >
                        {loading ? 'Creating…' : 'Create link'}
                    </button>

                    {shareUrl && (
                        <div className="share-modal__link-row">
                            <input className="share-modal__input" readOnly value={shareUrl} />
                            <button type="button" className="share-modal__btn" onClick={handleCopy}>
                                Copy
                            </button>
                        </div>
                    )}

                    {error && <p className="share-modal__error">{error}</p>}
                </section>

                <section className="share-modal__section">
                    <h3>Export JSON</h3>
                    <p className="share-modal__hint">Download the full structure as a file.</p>
                    {emptySchema && (
                        <p className="share-modal__error">
                            Add at least one block to the canvas before exporting.
                        </p>
                    )}
                    <button type="button" className="share-modal__btn" onClick={handleExport} disabled={emptySchema}>
                        Download JSON
                    </button>
                </section>
            </div>
        </div>
    );
}