'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BAY_AREA_ZIPS } from '@/lib/bayAreaZips'

export default function NewListingPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const user = session.user
    let imageUrl = null

    if (image) {
      const ext = image.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, image)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path)

      imageUrl = publicUrl
    }

    const { error: insertError } = await supabase.from('listings').insert({
      seller_id: user.id,
      title,
      description,
      price: isFree ? null : parseFloat(price),
      is_free: isFree,
      category,
      image_url: imageUrl,
      lat: zipCode ? BAY_AREA_ZIPS[zipCode].lat : null,
      lng: zipCode ? BAY_AREA_ZIPS[zipCode].lng : null,
    })

    if (insertError) {
      setError('Error: ' + insertError.message)
      setLoading(false)
      return
    }

    router.push('/listings')
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 font-serif">New listing</h1>
          <p className="text-sm text-stone-400 mt-0.5">Share something you've baked</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. Sourdough loaf"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Description</label>
            <textarea
              placeholder="Tell people what makes it special..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
            >
              <option value="">Select category</option>
              <option value="bread">🍞 Bread</option>
              <option value="pastry">🥐 Pastry</option>
              <option value="cake">🎂 Cake</option>
              <option value="cookies">🍪 Cookies</option>
              <option value="other">✨ Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Your area</label>
            <select
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
            >
              <option value="">Select your area</option>
              {Object.entries(BAY_AREA_ZIPS).map(([zip, { label }]) => (
                <option key={zip} value={zip}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Pricing</label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={e => setIsFree(e.target.checked)}
                className="accent-mauve-400"
              />
              <label htmlFor="isFree" className="text-sm text-stone-600">This is free</label>
            </div>
            {!isFree && (
              <input
                type="number"
                placeholder="Price ($)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files?.[0] ?? null)}
              className="text-sm text-stone-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !title || !category}
            className="w-full py-3 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors mt-2"
          >
            {loading ? 'Posting...' : 'Post listing'}
          </button>
        </div>
      </div>
    </div>
  )
}