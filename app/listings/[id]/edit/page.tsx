'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { BAY_AREA_ZIPS } from '@/lib/bayAreaZips'

const PRESET_ALLERGENS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Soy', 'Sesame']

export default function EditListingPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [category, setCategory] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [allergens, setAllergens] = useState<string[]>([])
  const [customAllergen, setCustomAllergen] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function fetchListing() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!data || data.seller_id !== session.user.id) {
        router.push('/listings')
        return
      }

      setTitle(data.title)
      setDescription(data.description ?? '')
      setPrice(data.price?.toString() ?? '')
      setIsFree(data.is_free)
      setCategory(data.category ?? '')
      setAllergens(data.allergens ?? [])
      setImageUrl(data.image_url ?? null)

      const match = Object.entries(BAY_AREA_ZIPS).find(
        ([, val]) => val.lat === data.lat && val.lng === data.lng
      )
      if (match) setZipCode(match[0])

      setLoading(false)
    }
    fetchListing()
  }, [params.id])

  function toggleAllergen(allergen: string) {
    setAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    )
  }

  function addCustomAllergen() {
    const trimmed = customAllergen.trim()
    if (trimmed && !allergens.includes(trimmed)) {
      setAllergens(prev => [...prev, trimmed])
    }
    setCustomAllergen('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    let finalImageUrl = imageUrl

    if (image) {
      const ext = image.name.split('.').pop()
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, image)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path)

      finalImageUrl = publicUrl
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        description,
        price: isFree ? null : parseFloat(price),
        is_free: isFree,
        category,
        allergens,
        image_url: finalImageUrl,
        lat: zipCode ? BAY_AREA_ZIPS[zipCode].lat : null,
        lng: zipCode ? BAY_AREA_ZIPS[zipCode].lng : null,
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/listings/${params.id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-serif text-stone-800">Edit listing</h1>
          <p className="text-sm text-stone-400 mt-0.5">Update your listing details</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Description</label>
            <textarea
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
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Allergens</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_ALLERGENS.map(allergen => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    allergens.includes(allergen)
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom allergen..."
                value={customAllergen}
                onChange={e => setCustomAllergen(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomAllergen()}
                className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
              />
              <button
                type="button"
                onClick={addCustomAllergen}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
            {allergens.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allergens.map(a => (
                  <span
                    key={a}
                    className="flex items-center gap-1 px-2.5 py-1 bg-mauve-50 text-mauve-600 text-xs rounded-full"
                  >
                    {a}
                    <button onClick={() => toggleAllergen(a)} className="hover:text-mauve-800">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Photo</label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Current listing photo"
                className="w-full h-40 object-cover rounded-xl mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files?.[0] ?? null)}
              className="text-xs text-stone-500"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.push(`/listings/${params.id}`)}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title || !category}
              className="flex-1 py-3 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}