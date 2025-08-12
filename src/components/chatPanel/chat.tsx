'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { FiSend, FiPaperclip, FiMic, FiImage, FiVideo, FiFileText, FiX } from 'react-icons/fi'
import Popover from '../popover/popover'
import { useAppDispatch } from '@/lib/hooks'
import { sendMessage } from '@/lib/features/chat/chatSlice'
import { closePopover } from '@/lib/features/popoverSlice/popoverSlice'

const MAX_FILES = 6
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED = ['image/', 'video/', 'application/']

export default function ChatInput() {
    const dispatch = useAppDispatch()
    const inputRef = useRef<HTMLDivElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [content, setContent] = useState('')
    const [files, setFiles] = useState<{ id: string; file: File; url: string }[]>([])

    const plainText = () => inputRef.current?.textContent?.replace(/\u00A0/g, ' ').trim() ?? ''

    useEffect(() => {
        const el = inputRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 224)}px`
    }, [content, files.length])

    useEffect(() => () => files.forEach(f => URL.revokeObjectURL(f.url)), [files])

    const addFiles = (list: FileList) => {
        const added = Array.from(list)
            .slice(0, MAX_FILES - files.length)
            .filter(f => f.size <= MAX_SIZE && ALLOWED.some(p => f.type.startsWith(p)))
            .map(f => ({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f) }))
        if (added.length) {
            setFiles(p => [...p, ...added])
            dispatch(closePopover())
        }
    }

    const removeFile = (id: string) => {
        setFiles(prev => {
            const f = prev.find(x => x.id === id)
            if (f) URL.revokeObjectURL(f.url)
            return prev.filter(x => x.id !== id)
        })
    }

    const submit = () => {
        const text = plainText()
        if (!text && !files.length) return
        dispatch(sendMessage({ text, files: files.map(f => f.file) }))
        setContent('')
        inputRef.current && (inputRef.current.textContent = '')
        files.forEach(f => URL.revokeObjectURL(f.url))
        setFiles([])
    }

    const menu = (
        <div className="glass !bg-[#2a2a2e]/90 rounded-md shadow-lg p-2 w-40">
            {[
                { label: 'Image', icon: <FiImage />, accept: 'image/*' },
                { label: 'Video', icon: <FiVideo />, accept: 'video/*' },
                { label: 'File', icon: <FiFileText />, accept: '*/*' }
            ].map(({ label, icon, accept }) => (
                <button
                    key={label}
                    onClick={() => { fileRef.current!.accept = accept; fileRef.current!.click() }}
                    className="w-full text-left p-2 text-sm text-white/90 rounded hover:bg-white/20 flex items-center gap-3 cursor-pointer"
                >
                    {icon} {label}
                </button>
            ))}
        </div>
    )

    const previews = useMemo(() => files.map(f => (
        <div key={f.id} className="relative inline-block">
            {f.file.type.startsWith('image/') ? (
                <img src={f.url} alt={f.file.name} className="w-[120px] h-[120px] object-cover rounded-md" />
            ) : (
                <div className="flex items-center gap-2 text-white/90 p-2 border border-white/20 rounded-md max-w-[200px]">
                    <FiFileText size={20} /><span className="truncate">{f.file.name}</span>
                </div>
            )}
            <button
                onClick={() => removeFile(f.id)}
                aria-label={`Remove ${f.file.name}`}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors cursor-pointer"
            >
                <FiX size={14} />
            </button>
        </div>
    )), [files])

    return (
        <div className="bg-transparent p-4">
            <input ref={fileRef} type="file" onChange={e => e.target.files && addFiles(e.target.files)} style={{ display: 'none' }} multiple />
            <div className="w-full max-w-4xl mx-auto">
                <div className="glass !bg-[#1e1e1e]/80 border border-white/20 rounded-xl shadow-lg p-2">
                    {!!files.length && <div className="flex flex-wrap gap-2 p-2 mb-2 bg-black/20 rounded-lg max-h-[140px] overflow-y-auto">{previews}</div>}
                    <div
                        ref={inputRef}
                        onInput={() => setContent(plainText())}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())}
                        onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')) }}
                        contentEditable
                        role="textbox"
                        tabIndex={0}
                        className="relative bg-transparent p-2 text-white/90 focus:outline-none max-h-56 overflow-y-auto min-h-[40px] cursor-text"
                        data-placeholder={files.length ? 'Add a comment...' : 'Type a message...'}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                            <Popover popoverId="attachment-popover" side="top" align="start" content={menu} trigger={<button className="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 cursor-pointer"><FiPaperclip size={20} /></button>} />
                            <button className="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 cursor-pointer"><FiMic size={20} /></button>
                        </div>
                        <button
                            onClick={submit}
                            disabled={!content.trim() && !files.length}
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <FiSend size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
