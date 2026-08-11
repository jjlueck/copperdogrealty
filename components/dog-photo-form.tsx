"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { upload } from "@vercel/blob/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Camera, CheckCircle2 } from "lucide-react"
import { BLOB_PATH_PREFIX, MAX_UPLOAD_BYTES } from "@/lib/dog-photo"

const EMPTY_FIELDS = {
  dogName: "",
  senderName: "",
  email: "",
  message: "",
  website: "", // honeypot
}

/** Build a tidy blob pathname. Uniqueness comes from addRandomSuffix server-side. */
function blobPathnameFor(file: File, dogName: string) {
  const extension = file.name.split(".").pop()?.toLowerCase()
  const safeExtension = extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : "jpg"
  const slug = dogName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${BLOB_PATH_PREFIX}${slug || "good-dog"}.${safeExtension}`
}

export function DogPhotoForm() {
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [consent, setConsent] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Release the object URL whenever the selection changes or we unmount.
  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.id]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setError("")

    if (!selected) {
      setFile(null)
      setPreviewUrl(null)
      return
    }

    // Some browsers report an empty type; let the server make the final call there.
    if (selected.type && !selected.type.startsWith("image/")) {
      setError("That file isn't a photo. Please choose an image.")
      setFile(null)
      setPreviewUrl(null)
      return
    }

    if (selected.size > MAX_UPLOAD_BYTES) {
      setError("That photo is larger than 25MB. Please choose a smaller one.")
      setFile(null)
      setPreviewUrl(null)
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file || isSubmitting) return

    setIsSubmitting(true)
    setError("")
    setProgress(0)

    try {
      const blob = await upload(blobPathnameFor(file, fields.dogName), file, {
        access: "public",
        handleUploadUrl: "/api/dog-photo/upload",
        contentType: file.type || undefined,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })

      const response = await fetch("/api/dog-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, consent, blobUrl: blob.url }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.message || "Something went wrong. Please try again.")
        return
      }

      setIsDone(true)
    } catch (err) {
      console.error("Dog photo submission error:", err)
      setError("We couldn't upload that photo. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFields(EMPTY_FIELDS)
    setConsent(false)
    setFile(null)
    setPreviewUrl(null)
    setProgress(0)
    setIsDone(false)
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (isDone) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">
          Thanks for sharing{fields.dogName ? ` ${fields.dogName}` : ""}!
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
          Your photo is on its way to our office. Keep an eye out, your dog might be our next Dog of
          the Month.
        </p>
        <Button variant="outline" onClick={resetForm}>
          Share another dog
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="photo">Your dog&apos;s photo</Label>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden border border-border">
              {/* Object URL, so next/image optimization does not apply. */}
              <Image
                src={previewUrl}
                alt="The photo you selected"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose a different photo
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors py-10 px-4 flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <Camera className="w-8 h-8 text-primary" />
            <span className="font-medium text-foreground">Tap to add a photo</span>
            <span className="text-sm">Take one now or pick from your camera roll</span>
          </button>
        )}

        <Input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dogName">Your dog&apos;s name</Label>
        <Input
          id="dogName"
          placeholder="Waffles"
          value={fields.dogName}
          onChange={handleChange}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senderName">Your name</Label>
        <Input
          id="senderName"
          placeholder="Optional"
          value={fields.senderName}
          onChange={handleChange}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Optional"
          value={fields.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <p className="text-sm text-muted-foreground">
          Only so we can let you know if your dog is picked as Dog of the Month.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Anything you&apos;d like to tell us?</Label>
        <Textarea
          id="message"
          rows={4}
          placeholder="Optional"
          value={fields.message}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-primary"
        />
        <Label htmlFor="consent" className="text-sm font-normal leading-relaxed">
          Copper Dog Realty may feature my dog on their website and social media.
        </Label>
      </div>

      {/* Honeypot. Hidden from people, tempting to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!file || isSubmitting}>
        {isSubmitting ? "Sending…" : "Share my dog"}
      </Button>

      {isSubmitting && progress > 0 && (
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">Uploading… {progress}%</p>
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
